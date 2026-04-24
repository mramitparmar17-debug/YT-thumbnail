import React from 'react';

const tabs = ['Overview', 'Campaigns', 'Segmentation', 'Exports'];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">CA</div>
        <div>
          <h1>CRM Analyzer</h1>
          <p>Desktop Suite</p>
        </div>
      </div>

      <nav>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
    </aside>
  );
}
