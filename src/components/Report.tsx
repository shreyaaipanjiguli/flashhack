import React from 'react';

interface ReportProps {
  report: {[key:string]: any};
}

const Report: React.FC<ReportProps> = ({ report }) => {
  if (!report || Object.keys(report).length===0) return null;
  return (
    <section className="merge-report">
      <h2>Merge Report</h2>
      <ul>
        <li>Total Input Jobs: {report.totalJobs}</li>
        <li>Total Output Jobs: {report.totalOutput}</li>
        <li>Departments Processed: {report.totalDepts}</li>
        <li>Empty Queues: {report.emptyQueues}</li>
        <li>Duplicate Timestamps: {report.duplicateTimestamps}</li>
        <li>All jobs preserved: {report.preserved ? '✔' : '✘'}</li>
        <li>Output sorted: {report.sorted ? '✔' : '✘'}</li>
        <li>Processing time: {report.duration}</li>
      </ul>
    </section>
  );
};

export default Report;
