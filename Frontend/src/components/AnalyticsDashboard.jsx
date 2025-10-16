import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { API_BASE_URL } from "../api";

const AnalyticsDashboard = ({ user, isOpen, onClose }) => {
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      const fetchStats = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/habits/stats`, { headers: getAuthHeaders() });
          if (!res.ok) throw new Error("Failed to fetch stats");
          const data = await res.json();
          setStatsData(data);
        } catch (err) {
          console.error("Error fetching stats:", err);
          setStatsData([]);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-gray-700">
          <p className="text-sm font-semibold text-[var(--text-color)]">{`${label}`}</p>
          <p className="text-xs text-violet-400">{`Completions: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-2xl p-6 space-y-4">
        <h2 className="text-2xl font-bold text-[var(--text-color)] drop-shadow">Weekly Progress</h2>
        
        <div className="w-full h-80">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-[var(--text-color-muted)]">Loading Analytics...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={statsData} 
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="aurora" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8A2BE2" stopOpacity={0.9}/>
                    <stop offset="50%" stopColor="#FF00FF" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#00BFFF" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="var(--text-color-muted)" strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: 'var(--text-color-muted)' }} 
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                  tick={{ fill: 'var(--text-color-muted)' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(138, 43, 226, 0.1)' }} />
                
                <Bar dataKey="completions" fill="url(#aurora)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--glass-border)]">
          <button onClick={onClose} className="glass-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
