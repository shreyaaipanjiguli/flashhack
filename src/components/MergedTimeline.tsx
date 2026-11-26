import React from 'react';
import { Job } from '../types';

interface MergedTimelineProps {
  merged: Job[];
}

const MergedTimeline: React.FC<MergedTimelineProps> = ({ merged }) => {
  // Find positions where timestamp repeats to apply highlight class
  const timestampCounts: Record<number, number> = {};
  merged.forEach(j => {
    timestampCounts[j.timestamp] = (timestampCounts[j.timestamp] || 0) + 1;
  });

  return (
    <section className="merged-timeline">
      <h2>Merged Timeline</h2>
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Job ID</th>
            <th>Department</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {merged.map((job, idx) => (
            <tr key={idx} className={timestampCounts[job.timestamp] > 1 ? 'duplicate' : ''}>
              <td>{idx + 1}</td>
              <td>{job.id}</td>
              <td>{job.department}</td>
              <td>{job.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default MergedTimeline;
