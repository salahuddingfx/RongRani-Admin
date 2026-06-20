import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AppInitializer = ({ children }) => {
  const { isLoading } = useAuth();
  const [initComplete, setInitComplete] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => setInitComplete(true), 200);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (!initComplete || isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center z-50">
        <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading admin panel...</p>
      </div>
    );
  }

  return children;
};

export default AppInitializer;
