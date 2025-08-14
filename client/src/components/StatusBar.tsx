import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
  fileName?: string;
  modifiedCount: number;
  error?: string | null;
  isLoading: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({
  fileName,
  modifiedCount,
  error,
  isLoading
}) => {
  const getStatusText = () => {
    if (isLoading) return 'Loading...';
    if (error) return 'Error';
    if (fileName) return 'Ready';
    return 'No file loaded';
  };

  const getStatusColor = () => {
    if (isLoading) return 'loading';
    if (error) return 'error';
    return 'ready';
  };

  return (
    <footer className="status-bar">
      <div className="status-item">
        <div className={`status-indicator ${getStatusColor()}`}></div>
        <span>{getStatusText()}</span>
      </div>
      
      <div className="status-item">
        {fileName && (
          <span>File: {fileName}</span>
        )}
      </div>
      
      <div className="status-item">
        {modifiedCount > 0 && (
          <span>{modifiedCount} tags modified</span>
        )}
      </div>
      
      {error && (
        <div className="status-item error-message">
          <span>⚠️ {error}</span>
        </div>
      )}
    </footer>
  );
};

export default StatusBar;
