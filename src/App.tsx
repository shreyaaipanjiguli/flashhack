import React, { useMemo, useState } from "react";
import { DepartmentQueue, Job } from "./types";
import { mergeQueues } from "./data/mergeQueues";

type View = "overview" | "departments" | "queues" | "merge" | "reports";

interface MergeReport {
  totalJobs: number;
  totalOutput: number;
  totalDepts: number;
  emptyQueues: number;
  duplicateTimestamps: number;
  preserved: boolean;
  sorted: boolean;
  duration: string;
}

const sampleData: DepartmentQueue[] = [
  {
    code: "A",
    jobs: [
      { id: "A-102", timestamp: 2, originalPos: 0 },
      { id: "A-107", timestamp: 7, originalPos: 1 },
      { id: "A-109", timestamp: 9, originalPos: 2 }
    ]
  },
  {
    code: "B",
    jobs: [
      { id: "B-101", timestamp: 1, originalPos: 0 },
      { id: "B-107", timestamp: 7, originalPos: 1 }
    ]
  },
  {
    code: "C",
    jobs: [
      { id: "C-103", timestamp: 3, originalPos: 0 },
      { id: "C-110", timestamp: 10, originalPos: 1 }
    ]
  }
];

const navigation: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "01" },
  { id: "departments", label: "Departments", icon: "02" },
  { id: "queues", label: "Queue visualizer", icon: "03" },
  { id: "merge", label: "Merge studio", icon: "04" },
  { id: "reports", label: "Reports", icon: "05" }
];

const App: React.FC = () => {
  const [view, setView] = useState<View>("overview");
  const [departments, setDepartments] = useState<DepartmentQueue[]>([]);
  const [merged, setMerged] = useState<Job[]>([]);
  const [report, setReport] = useState<MergeReport | null>(null);
  const [departmentCode, setDepartmentCode] = useState("");
  const [jobDrafts, setJobDrafts] = useState<
    Record<string, { id: string; timestamp: string }>
  >({});
  const [notice, setNotice] = useState("");

  const totalJobs = useMemo(
    () => departments.reduce((sum, dept) => sum + dept.jobs.length, 0),
    [departments]
  );

  const emptyQueues = departments.filter(
    dept => dept.jobs.length === 0
  ).length;

  const duplicateTimestamps = useMemo(() => {
    const counts = new Map<number, number>();

    departments.forEach(dept => {
      dept.jobs.forEach(job => {
        counts.set(
          job.timestamp,
          (counts.get(job.timestamp) || 0) + 1
        );
      });
    });

    return [...counts.values()].reduce(
      (sum, count) => sum + Math.max(0, count - 1),
      0
    );
  }, [departments]);

  const invalidateMerge = () => {
    setMerged([]);
    setReport(null);
  };

  const updateDepartments = (next: DepartmentQueue[]) => {
    setDepartments(next);
    invalidateMerge();
  };

  const addDepartment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = departmentCode.trim().toUpperCase();

    if (!code) {
      setNotice("Please enter a department code.");
      return;
    }

    if (departments.some(dept => dept.code === code)) {
      setNotice("This department already exists.");
      return;
    }

    updateDepartments([
      ...departments,
      { code, jobs: [] }
    ]);

    setDepartmentCode("");
    setNotice(`Department ${code} created successfully.`);
  };

  const removeDepartment = (code: string) => {
    updateDepartments(
      departments.filter(dept => dept.code !== code)
    );

    setNotice(`Department ${code} removed.`);
  };

  const addJob = (
    event: React.FormEvent<HTMLFormElement>,
    code: string
  ) => {
    event.preventDefault();

    const draft = jobDrafts[code] || {
      id: "",
      timestamp: ""
    };

    const id = draft.id.trim();
    const timestamp = Number(draft.timestamp);

    if (!id || draft.timestamp.trim() === "") {
      setNotice("Enter both a job ID and timestamp.");
      return;
    }

    if (!Number.isFinite(timestamp) || timestamp < 0) {
      setNotice("Timestamp must be a valid non-negative number.");
      return;
    }

    const department = departments.find(
      dept => dept.code === code
    );

    if (!department) return;

    if (department.jobs.some(job => job.id === id)) {
      setNotice("Job IDs must be unique within a department.");
      return;
    }

    const lastJob = department.jobs[department.jobs.length - 1];

    if (lastJob && timestamp < lastJob.timestamp) {
      setNotice(
        `Timestamp must be at least ${lastJob.timestamp}.`
      );
      return;
    }

    const newJob: Job = {
      id,
      timestamp,
      originalPos: department.jobs.length
    };

    updateDepartments(
      departments.map(dept =>
        dept.code === code
          ? { ...dept, jobs: [...dept.jobs, newJob] }
          : dept
      )
    );

    setJobDrafts(current => ({
      ...current,
      [code]: { id: "", timestamp: "" }
    }));

    setNotice(`Job ${id} added to ${code}.`);
  };

  const removeJob = (code: string, jobIndex: number) => {
    updateDepartments(
      departments.map(dept =>
        dept.code === code
          ? {
              ...dept,
              jobs: dept.jobs
                .filter((_, index) => index !== jobIndex)
                .map((job, index) => ({
                  ...job,
                  originalPos: index
                }))
            }
          : dept
      )
    );

    setNotice("Job removed successfully.");
  };

  const loadSample = () => {
    updateDepartments(
      sampleData.map(dept => ({
        ...dept,
        jobs: dept.jobs.map(job => ({ ...job }))
      }))
    );

    setNotice("Sample dataset loaded.");
    setView("overview");
  };

  const resetAll = () => {
    updateDepartments([]);
    setJobDrafts({});
    setNotice("Workspace reset successfully.");
  };

  const handleMerge = () => {
    if (departments.length === 0 || totalJobs === 0) {
      setNotice("Add at least one job before merging.");
      return;
    }

    const start = performance.now();
    const result = mergeQueues(departments);
    const duration = performance.now() - start;

    const sorted = result.every(
      (job, index) =>
        index === 0 ||
        job.timestamp >= result[index - 1].timestamp
    );

    const nextReport: MergeReport = {
      totalJobs,
      totalOutput: result.length,
      totalDepts: departments.length,
      emptyQueues,
      duplicateTimestamps,
      preserved: result.length === totalJobs,
      sorted,
      duration: `${duration.toFixed(3)} ms`
    };

    setMerged(result);
    setReport(nextReport);

    setNotice(
      sorted && nextReport.preserved
        ? "Merge completed. Verification checks passed."
        : "Merge completed, but verification failed."
    );
  };

  const pageTitle = navigation.find(
    item => item.id === view
  )?.label || "Overview";

  const renderOverview = () => (
    <>
      <section className="welcome-row">
        <div>
          <span className="eyebrow">WORKSPACE OVERVIEW</span>
          <h2>Print operations at a glance.</h2>
          <p>
            Manage department queues and consolidate jobs by timestamp.
          </p>
        </div>

        <button className="button button-primary" onClick={loadSample}>
          Load sample data <span>+</span>
        </button>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Total departments" value={departments.length} icon="D" />
        <MetricCard label="Jobs received" value={totalJobs} icon="J" />
        <MetricCard label="Empty queues" value={emptyQueues} icon="E" />
        <MetricCard label="Repeated timestamps" value={duplicateTimestamps} icon="T" />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">QUEUE ACTIVITY</span>
              <h3>Department queues</h3>
            </div>

            <button
              className="text-button"
              onClick={() => setView("departments")}
            >
              Manage departments →
            </button>
          </div>

          {departments.length === 0 ? (
            <EmptyState
              title="Your workspace is empty"
              description="Add departments and jobs, or load the sample dataset."
              action="Load sample data"
              onAction={loadSample}
            />
          ) : (
            <div className="activity-list">
              {departments.map(dept => (
                <div className="activity-item" key={dept.code}>
                  <div className="department-avatar">
                    {dept.code.slice(0, 2)}
                  </div>

                  <div className="activity-copy">
                    <strong>Department {dept.code}</strong>
                    <span>{dept.jobs.length} jobs in queue</span>
                  </div>

                  <span className="status-pill">
                    {dept.jobs.length ? "Active" : "Empty"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel quick-panel">
          <span className="eyebrow">QUICK ACTIONS</span>
          <h3>What would you like to do?</h3>

          <QuickAction
            icon="+"
            title="Add departments"
            description="Create queues and add print jobs"
            onClick={() => setView("departments")}
          />

          <QuickAction
            icon=">"
            title="Inspect queues"
            description="View jobs in linked-list order"
            onClick={() => setView("queues")}
          />

          <QuickAction
            icon="M"
            title="Open merge studio"
            description="Consolidate department queues"
            onClick={() => setView("merge")}
          />
        </div>
      </section>

      <section className="panel algorithm-panel">
        <div>
          <span className="eyebrow">UNDER THE HOOD</span>
          <h3>Efficient K-way merge</h3>
          <p>
            QueueMerge uses linked lists and a min-heap to merge
            sorted department queues without sorting every job again.
          </p>
        </div>

        <div className="complexity">
          <span>TIME COMPLEXITY</span>
          <strong>O(N log K)</strong>
          <small>N = total jobs · K = departments</small>
        </div>
      </section>
    </>
  );

  const renderDepartments = () => (
    <section className="page-stack">
      <div className="welcome-row compact">
        <div>
          <span className="eyebrow">QUEUE CONFIGURATION</span>
          <h2>Manage departments</h2>
          <p>Create queues and add jobs in timestamp order.</p>
        </div>
      </div>

      <form className="panel add-department-form" onSubmit={addDepartment}>
        <div className="form-heading">
          <div className="quick-icon">+</div>
          <div>
            <h3>New department</h3>
            <p>Give your queue a unique department code.</p>
          </div>
        </div>

        <div className="inline-form">
          <input
            value={departmentCode}
            onChange={event => setDepartmentCode(event.target.value)}
            placeholder="e.g. A, B, PRINT-01"
            aria-label="Department code"
            maxLength={16}
          />

          <button className="button button-primary" type="submit">
            Add department
          </button>
        </div>
      </form>

      <div className="section-heading">
        <div>
          <h3>Your departments</h3>
          <p>{departments.length} configured queues</p>
        </div>

        <button className="text-button" onClick={loadSample}>
          Load sample dataset
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No departments yet"
            description="Create your first department to get started."
          />
        </div>
      ) : (
        <div className="department-grid">
          {departments.map(dept => {
            const draft = jobDrafts[dept.code] || {
              id: "",
              timestamp: ""
            };

            return (
              <article className="panel department-card" key={dept.code}>
                <div className="department-card-heading">
                  <div className="department-avatar large">
                    {dept.code.slice(0, 2)}
                  </div>

                  <div className="department-title">
                    <h3>Department {dept.code}</h3>
                    <span>{dept.jobs.length} jobs</span>
                  </div>

                  <button
                    className="icon-button danger"
                    onClick={() => removeDepartment(dept.code)}
                    aria-label={`Remove department ${dept.code}`}
                  >
                    ×
                  </button>
                </div>

                <div className="job-preview">
                  {dept.jobs.length === 0 ? (
                    <span className="muted">No jobs in this queue yet.</span>
                  ) : (
                    dept.jobs.map((job, index) => (
                      <div className="job-row" key={`${job.id}-${index}`}>
                        <span className="job-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <strong>{job.id}</strong>
                        <span className="job-time">t = {job.timestamp}</span>

                        <button
                          className="remove-job"
                          onClick={() => removeJob(dept.code, index)}
                          aria-label={`Remove job ${job.id}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <form
                  className="job-entry"
                  onSubmit={event => addJob(event, dept.code)}
                >
                  <input
                    value={draft.id}
                    onChange={event =>
                      setJobDrafts(current => ({
                        ...current,
                        [dept.code]: {
                          ...draft,
                          id: event.target.value
                        }
                      }))
                    }
                    placeholder="Job ID"
                    aria-label={`Job ID for ${dept.code}`}
                  />

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={draft.timestamp}
                    onChange={event =>
                      setJobDrafts(current => ({
                        ...current,
                        [dept.code]: {
                          ...draft,
                          timestamp: event.target.value
                        }
                      }))
                    }
                    placeholder="Timestamp"
                    aria-label={`Timestamp for ${dept.code}`}
                  />

                  <button type="submit" className="button button-secondary">
                    Add job +
                  </button>
                </form>

                <p className="helper-text">
                  Jobs must be entered in non-decreasing timestamp order.
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderQueues = () => (
    <section className="page-stack">
      <div className="welcome-row compact">
        <div>
          <span className="eyebrow">DATA STRUCTURE VIEW</span>
          <h2>Queue visualizer</h2>
          <p>Each department is represented as a linked list.</p>
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="No queues to visualize"
            description="Load sample data or create a department first."
            action="Load sample data"
            onAction={loadSample}
          />
        </div>
      ) : (
        departments.map(dept => (
          <section className="panel queue-panel" key={dept.code}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">LINKED LIST</span>
                <h3>Department {dept.code}</h3>
              </div>
              <span className="status-pill">
                {dept.jobs.length} nodes
              </span>
            </div>

            <div className="linked-list">
              <div className="head-label">HEAD</div>

              {dept.jobs.length === 0 ? (
                <span className="muted">Empty linked list</span>
              ) : (
                dept.jobs.map((job, index) => (
                  <React.Fragment key={`${job.id}-${index}`}>
                    <div className="queue-node">
                      <strong>{job.id}</strong>
                      <span>t = {job.timestamp}</span>
                      <small>Node {index + 1}</small>
                    </div>

                    {index < dept.jobs.length - 1 && (
                      <span className="queue-arrow">→</span>
                    )}
                  </React.Fragment>
                ))
              )}

              <span className="null-node">NULL</span>
            </div>
          </section>
        ))
      )}
    </section>
  );

  const renderMerge = () => (
    <section className="page-stack">
      <div className="welcome-row compact">
        <div>
          <span className="eyebrow">CONSOLIDATION ENGINE</span>
          <h2>Merge studio</h2>
          <p>Combine sorted department queues using a min-heap.</p>
        </div>

        <button
          className="button button-primary"
          onClick={handleMerge}
          disabled={totalJobs === 0}
        >
          Merge all queues →
        </button>
      </div>

      <div className="metrics-grid merge-metrics">
        <MetricCard label="Input departments" value={departments.length} icon="D" />
        <MetricCard label="Total input jobs" value={totalJobs} icon="J" />
        <MetricCard label="Empty queues" value={emptyQueues} icon="E" />
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">MERGE INPUT</span>
            <h3>Department queue heads</h3>
          </div>
          <span className="status-pill">Ready for processing</span>
        </div>

        {departments.length === 0 ? (
          <EmptyState
            title="No department queues"
            description="Add departments and jobs before starting a merge."
            action="Go to departments"
            onAction={() => setView("departments")}
          />
        ) : (
          <div className="merge-input-grid">
            {departments.map(dept => (
              <div className="merge-input-card" key={dept.code}>
                <span className="eyebrow">DEPARTMENT {dept.code}</span>
                {dept.jobs.length ? (
                  <>
                    <strong>{dept.jobs[0].id}</strong>
                    <span>Timestamp: {dept.jobs[0].timestamp}</span>
                    <small>{dept.jobs.length} total jobs</small>
                  </>
                ) : (
                  <span className="muted">Empty queue</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">MERGED OUTPUT</span>
            <h3>Consolidated job sequence</h3>
          </div>
          <span className="status-pill">
            {merged.length} output jobs
          </span>
        </div>

        {merged.length === 0 ? (
          <EmptyState
            title="No merged output yet"
            description="Start a merge to see the consolidated sequence."
          />
        ) : (
          <div className="merged-sequence">
            {merged.map((job, index) => (
              <div className="merged-job" key={`${job.department}-${job.id}-${index}`}>
                <span className="merged-position">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{job.id}</strong>
                <span>{job.department}</span>
                <small>t = {job.timestamp}</small>
              </div>
            ))}
          </div>
        )}

        {merged.length > 0 && (
          <div className="merge-success">
            <span className="success-icon">✓</span>
            <div>
              <strong>Merge completed</strong>
              <p>
                {report?.preserved && report?.sorted
                  ? "All verification checks passed."
                  : "Please inspect the verification report."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="panel algorithm-panel">
        <div>
          <span className="eyebrow">ALGORITHM</span>
          <h3>Linked List + Min Heap</h3>
          <p>
            The algorithm repeatedly extracts the smallest current
            queue head and advances only that department's linked list.
          </p>
        </div>
        <div className="complexity">
          <span>TIME COMPLEXITY</span>
          <strong>O(N log K)</strong>
          <small>N = jobs, K = departments</small>
        </div>
      </div>
    </section>
  );

  const renderReports = () => (
    <section className="page-stack">
      <div className="welcome-row compact">
        <div>
          <span className="eyebrow">VERIFICATION & ANALYTICS</span>
          <h2>Merge reports</h2>
          <p>Review correctness and processing metrics.</p>
        </div>
      </div>

      {!report ? (
        <div className="panel">
          <EmptyState
            title="No report available"
            description="Run a merge to generate its verification report."
            action="Open merge studio"
            onAction={() => setView("merge")}
          />
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            <MetricCard label="Input jobs" value={report.totalJobs} icon="I" />
            <MetricCard label="Output jobs" value={report.totalOutput} icon="O" />
            <MetricCard label="Departments" value={report.totalDepts} icon="D" />
            <MetricCard label="Execution time" value={report.duration} icon="T" />
          </div>

          <div className="panel report-panel">
            <span className="eyebrow">INTEGRITY CHECKS</span>
            <h3>Merge verification</h3>

            <VerificationRow
              label="All input jobs preserved"
              passed={report.preserved}
            />
            <VerificationRow
              label="Output sorted by timestamp"
              passed={report.sorted}
            />

            <VerificationRow
              label="Output count matches input count"
              passed={report.totalJobs === report.totalOutput}
            />

            <div className="report-detail">
              <span>Empty queues</span>
              <strong>{report.emptyQueues}</strong>
            </div>

            <div className="report-detail">
              <span>Repeated timestamps</span>
              <strong>{report.duplicateTimestamps}</strong>
            </div>
          </div>
        </>
      )}
    </section>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Q</div>
          <div>
            <strong>QueueMerge</strong>
            <span>PRINT OPERATIONS</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navigation.map(item => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => setView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {view === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="online-dot" />
            <div>
              <strong>System operational</strong>
              <small>Local workspace</small>
            </div>
          </div>

          <div className="sidebar-footer">
            QueueMerge v1.0
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{pageTitle}</strong>
          </div>

          <div className="topbar-right">
            <span className="topbar-status">
              <span className="online-dot" />
              All systems normal
            </span>
            <div className="user-avatar">QM</div>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice("")}>×</button>
            </div>
          )}

          {view === "overview" && renderOverview()}
          {view === "departments" && renderDepartments()}
          {view === "queues" && renderQueues()}
          {view === "merge" && renderMerge()}
          {view === "reports" && renderReports()}

          <footer className="page-footer">
            <span>QueueMerge · Print Queue Consolidation System</span>
            <span>Linked Lists + Min Heap</span>
          </footer>
        </div>
      </main>
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  icon: string;
}> = ({ label, value, icon }) => (
  <div className="metric-card">
    <div className="metric-top">
      <span>{label}</span>
      <span className="metric-icon">{icon}</span>
    </div>
    <strong>{value}</strong>
    <small>Current workspace</small>
  </div>
);

const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}> = ({ title, description, action, onAction }) => (
  <div className="empty-state">
    <div className="empty-icon">Q</div>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && onAction && (
      <button className="button button-secondary" onClick={onAction}>
        {action}
      </button>
    )}
  </div>
);

const QuickAction: React.FC<{
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
  <button className="quick-action" onClick={onClick}>
    <span className="quick-icon">{icon}</span>
    <span>
      <strong>{title}</strong>
      <small>{description}</small>
    </span>
    <span className="quick-arrow">→</span>
  </button>
);

const VerificationRow: React.FC<{
  label: string;
  passed: boolean;
}> = ({ label, passed }) => (
  <div className="verification-row">
    <span className={passed ? "verification-check" : "verification-fail"}>
      {passed ? "✓" : "!"}
    </span>
    <span>{label}</span>
    <strong className={passed ? "passed-text" : "failed-text"}>
      {passed ? "Passed" : "Failed"}
    </strong>
  </div>
);

export default App;
