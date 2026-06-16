import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Database, RefreshCcw, Wifi } from 'lucide-react';
import { useSocket } from '../contexts/socketContextBase';

const AdminStatus = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const { connected } = useSocket() || {};

  const fetchHealth = async () => {
    try {
      const response = await axios.get('/api/health');
      setHealth(response.data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-maroon">System Status</h1>
          <p className="text-slate">Quick health snapshot of API, database, and socket.</p>
        </div>
        <button
          onClick={fetchHealth}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm text-slate">API Status</p>
              <p className="text-xl font-bold text-charcoal">
                {health?.status === 'ok' ? 'Healthy' : 'Unknown'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate mt-4">
            Uptime: {health ? Math.floor(health.uptime || 0) : 0}s
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-slate">Database</p>
              <p className="text-xl font-bold text-charcoal">
                {health?.db?.state || 'unknown'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate mt-4">
            Last check: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <Wifi className={`h-6 w-6 ${connected ? 'text-emerald-600' : 'text-red-600'}`} />
            <div>
              <p className="text-sm text-slate">Socket</p>
              <p className="text-xl font-bold text-charcoal">
                {connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate mt-4">
            Real-time events: {connected ? 'Live' : 'Offline'}
          </p>
        </div>
      </div>

      {!health && (
        <div className="card text-center text-slate">
          Unable to load health data. Check API connectivity.
        </div>
      )}
    </div>
  );
};

export default AdminStatus;
