import React from 'react';
import { DepartmentQueue } from '../types';

interface DashboardProps {
  stats: {
    totalDepts: number;
    totalJobs: number;
    emptyQueues: number;
    duplicateTimestamps: number;
  };
  report: {[key:string]: any};
  processing: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, report, processing }) => {
  return (
    <section className="dashboard">
      <div className="cards">
        <div className="card">
          <h3>Total Departments</h3>
          <p>{stats.totalDepts}</p>
        </div>
        <div className="card">
          <h3>Total Jobs Received</h3>
          <p>{stats.totalJobs}</p>
        </div>
        <div className="card">
          <h3>Empty Queues</h3>
          <p>{stats.emptyQueues}</p>
        </div>
        <div className="card">
          <h3>Duplicate Timestamps</h3>
          <p>{stats.duplicateTimestamps}</p>
        </div>
        {processing && (
          <div className="card status-card">
            <h3>Status</h3>
            <p>Processing…</p>
          </div>
        )}
        {report && report.duration && (
          <div className="card status-card">
            <h3>Last Merge Duration</h3>
            <p>{report.duration}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
