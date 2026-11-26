import React, { useState } from 'react';
import { DepartmentQueue, Job } from '../types';

interface DepartmentFormProps {
  departments: DepartmentQueue[];
  setDepartments: React.Dispatch<React.SetStateAction<DepartmentQueue[]>>;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ departments, setDepartments }) => {
  const [deptCode, setDeptCode] = useState('');
  const [jobId, setJobId] = useState('');
  const [timestamp, setTimestamp] = useState('');

  const addDepartment = () => {
    if (!deptCode.trim()) return alert('Department code required');
    if (departments.some(d => d.code === deptCode.trim()))
      return alert('Department code must be unique');
    setDepartments([...departments, { code: deptCode.trim(), jobs: [] }]);
    setDeptCode('');
  };

  const addJob = (deptIdx: number) => {
    if (!jobId.trim() || timestamp.trim() === '')
      return alert('Job ID and timestamp required');
    const ts = Number(timestamp);
    if (isNaN(ts) || ts < 0) return alert('Timestamp must be a non‑negative number');
    const dept = departments[deptIdx];
    const newJob: Job = { id: jobId.trim(), timestamp: ts, originalPos: dept.jobs.length };
    // Validate sorted order
    if (dept.jobs.length > 0 && ts < dept.jobs[dept.jobs.length - 1].timestamp) {
      return alert('Jobs must be added in non‑decreasing timestamp order');
    }
    const updated = [...departments];
    updated[deptIdx] = { ...dept, jobs: [...dept.jobs, newJob] };
    setDepartments(updated);
    setJobId('');
    setTimestamp('');
  };

  const removeDepartment = (code: string) => {
    setDepartments(departments.filter(d => d.code !== code));
  };

  const removeJob = (deptIdx: number, jobIdx: number) => {
    const updated = [...departments];
    const dept = updated[deptIdx];
    const newJobs = dept.jobs.filter((_, i) => i !== jobIdx).map((j, i) => ({ ...j, originalPos: i }));
    updated[deptIdx] = { ...dept, jobs: newJobs };
    setDepartments(updated);
  };

  return (
    <section className="department-form">
      <h2>Manage Departments</h2>
      <div className="add-dept">
        <input
          placeholder="Department Code"
          value={deptCode}
          onChange={e => setDeptCode(e.target.value)}
        />
        <button onClick={addDepartment}>Add Department</button>
      </div>
      {departments.map((dept, dIdx) => (
        <div key={dept.code} className="dept-block">
          <h3>{dept.code}</h3>
          <button className="remove-dept" onClick={() => removeDepartment(dept.code)}>
            Remove Department
          </button>
          <ul className="job-list">
            {dept.jobs.map((job, jIdx) => (
              <li key={jIdx}>
                {job.id} (t={job.timestamp})
                <button className="remove-job" onClick={() => removeJob(dIdx, jIdx)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="add-job">
            <input
              placeholder="Job ID"
              value={jobId}
              onChange={e => setJobId(e.target.value)}
            />
            <input
              placeholder="Timestamp"
              value={timestamp}
              onChange={e => setTimestamp(e.target.value)}
            />
            <button onClick={() => addJob(dIdx)}>Add Job</button>
          </div>
        </div>
      ))}
    </section>
  );
};

export default DepartmentForm;
