import React from 'react';

const AdminLoading = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 rounded-full" />
          <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-t-maroon rounded-full animate-spin" />
        </div>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 animate-pulse">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-6 h-6 border-[3px] border-slate-200 dark:border-slate-700 rounded-full" />
          <div className="absolute inset-0 w-6 h-6 border-[3px] border-transparent border-t-maroon rounded-full animate-spin" />
        </div>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 animate-pulse">{text}</p>
      </div>
    </div>
  );
};

export default AdminLoading;
