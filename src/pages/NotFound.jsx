import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Package } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* 404 Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[200px] md:text-[300px] font-black text-white/[0.03] leading-none">
          404
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 bg-maroon rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Package className="w-10 h-10 text-white" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-maroon text-white rounded-xl font-medium text-sm hover:bg-maroon/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>

      {/* Brand */}
      <div className="absolute bottom-8 opacity-30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-full p-0.5 overflow-hidden">
            <img src="/RongRani-Logo.png" alt="RongRani" className="w-full h-full object-cover" />
          </div>
          <span className="text-white font-semibold tracking-widest text-[10px] uppercase">RongRani</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
