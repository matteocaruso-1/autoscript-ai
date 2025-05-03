// src/components/DashboardPreview.tsx
import React from 'react';
import './DashboardPreview.css';

interface DashboardPreviewProps {
  displayName: string;
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({ displayName }) => {
  const initials = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="dashboard-preview">
      <div className="dashboard-preview__window">

        {/* ── Title Bar with full name */}
        <div className="dashboard-preview__header">
          <div className="dashboard-preview__controls">
            <span className="control control--red" />
            <span className="control control--yellow" />
            <span className="control control--green" />
          </div>
          <div className="dashboard-preview__title">AutoScript AI</div>
          <div className="dashboard-preview__user">
            <div className="dashboard-preview__avatar">{initials}</div>
            <span className="dashboard-preview__name">
              {displayName || 'Your Name'}
            </span>
          </div>
        </div>

        {/* ── “Screen” area */}
        <div className="dashboard-preview__body">
          {/* … your in-app mockup goes here … */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;