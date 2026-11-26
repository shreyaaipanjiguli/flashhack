import React from 'react';
import { DepartmentQueue } from '../types';

const QueueVisualizer: React.FC<{departments: DepartmentQueue[]}> = ({departments}) => {
  return (
    <section className="queue-visualizer">
      <h2>Department Queues</h2>
      {departments.length===0 && <p>No departments added.</p>}
      {departments.map(dept => (
        <div key={dept.code} className="dept-queue">
          <h3>{dept.code}</h3>
          <div className="linked-list">
            {dept.jobs.map((job, idx) => (
              <React.Fragment key={idx}>
                <span className="node">
                  {job.id}<br/><small>t={job.timestamp}</small>
                </span>
                {idx < dept.jobs.length-1 && <span className="arrow">→</span>}
              </React.Fragment>
            ))}
            {dept.jobs.length===0 && <span className="empty">(empty)</span>}
          </div>
        </div>
      ))}
    </section>
  );
};

export default QueueVisualizer;
