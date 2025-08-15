import React from 'react';
import { clearAuthData } from '../utils/authUtils';

const TestAuthClear = () => {
  const handleClearAuth = () => {
    clearAuthData();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleClearAuth}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
      >
        Clear Auth (Test)
      </button>
    </div>
  );
};

export default TestAuthClear;
