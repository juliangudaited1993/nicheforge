'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createTrendAlert, deleteTrendAlert, getUserAlerts } from '@/app/actions';

export default function AlertsPage() {
  const [keyword, setKeyword] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await getUserAlerts();
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreate = async () => {
    if (!keyword.trim()) return;
    const result = await createTrendAlert(keyword.trim(), frequency);
    if (result.success) {
      toast.success('Trend alert created.');
      setKeyword('');
      loadAlerts();
    } else {
      // Demo fallback
      const newAlert = {
        id: Date.now().toString(),
        keyword: keyword.trim(),
        frequency,
        min_score: 70,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setAlerts([newAlert, ...alerts]);
      setKeyword('');
      toast.success('Trend alert created (demo mode).');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTrendAlert(id);
    loadAlerts();
    toast.success('Alert deleted.');
  };

  const runTrendCheck = async (alert: any) => {
    toast.loading(`Running Grok Heavy trend scan for "${alert.keyword}"...`, { id: 'trend' });
    
    // Simulate a high-quality Grok-powered analysis (in real life this would be a server action calling Grok)
    await new Promise(r => setTimeout(r, 1350));
    
    const mockScore = 78 + Math.floor(Math.random() * 18);
    toast.success(`New high-potential opportunity found for "${alert.keyword}" (Score: ${mockScore})`, { id: 'trend' });
    
    // Show a mini actionable result
    setTimeout(() => {
      toast(`Top insight: Strong demand + low competition in the last 30 days. Consider running a full Deep Research report.`, { duration: 6000 });
    }, 800);
  };

  const toggleActive = async (alert: any) => {
    // In production this would call a server action to flip is_active
    const updated = alerts.map(a => a.id === alert.id ? { ...a, is_active: !a.is_active } : a);
    setAlerts(updated);
    toast.success(alert.is_active ? 'Alert paused' : 'Alert reactivated');
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Monthly Trend Alerts</h1>
      <p className="text-[#a1a1aa] mb-8">Get notified when high-potential topics matching your interests appear.</p>

      <div className="card rounded-2xl p-6 mb-8">
        <div className="flex gap-3">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Keyword to monitor (e.g. 'indie hacking tools')"
            className="input flex-1 rounded-2xl px-5"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="input rounded-2xl px-4"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
          <button onClick={handleCreate} className="btn-primary px-8 rounded-2xl font-semibold">Create</button>
        </div>
      </div>

      {loading ? (
        <div>Loading alerts...</div>
      ) : (
        <div className="space-y-3">
          {alerts.length === 0 && <p className="text-[#a1a1aa]">No alerts yet. Create one above.</p>}
          {alerts.map((alert) => (
            <div key={alert.id} className="card rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium tracking-tight">{alert.keyword}</div>
                <div className="text-xs text-[#a1a1aa] mt-0.5">{alert.frequency} monitoring • min score {alert.min_score}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => toggleActive(alert)} 
                  className={`text-xs px-4 py-1.5 rounded-full font-medium transition ${alert.is_active ? 'bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20' : 'bg-[#27272a] hover:bg-[#3f3f46]'}`}
                >
                  {alert.is_active ? 'ACTIVE' : 'PAUSED'}
                </button>
                <button 
                  onClick={() => runTrendCheck(alert)} 
                  className="text-xs px-4 py-1.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 font-medium"
                >
                  Run Grok Scan
                </button>
                <button onClick={() => handleDelete(alert.id)} className="text-xs px-3 py-1.5 text-[#a1a1aa] hover:text-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-[#52525b]">Real email delivery coming soon. Run Check uses Grok for trend analysis (demo).</p>
    </div>
  );
}
