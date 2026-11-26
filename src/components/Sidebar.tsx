import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => (
  <nav className="sidebar">
    <h2 className="logo">QueueMerge</h2>
    <ul className="nav-list">
      <li><a href="#dashboard">Dashboard</a></li>
      <li><a href="#departments">Departments</a></li>
      <li><a href="#merge">Merge</a></li>
    </ul>
  </nav>
);

export default Sidebar;
