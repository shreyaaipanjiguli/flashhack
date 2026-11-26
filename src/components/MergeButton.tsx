import React from 'react';

interface MergeButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const MergeButton: React.FC<MergeButtonProps> = ({ onClick, disabled }) => (
  <button className="merge-btn" onClick={onClick} disabled={disabled}>
    MERGE ALL QUEUES
  </button>
);

export default MergeButton;
