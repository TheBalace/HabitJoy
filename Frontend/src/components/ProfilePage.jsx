import { useEffect, useState } from "react";
import LevelProgressBar from "./LevelProgressBar";
import { API_BASE_URL } from "../api";

const allBadges = {
  POINTS_100: { name: "Point Collector", description: "Earn your first 100 points.", icon: "💰" },
  POINTS_500: { name: "Point Enthusiast", description: "Earn 500 points.", icon: "💎" },
  POINTS_1000: { name: "Point Master", description: "Earn 1,000 points.", icon: "👑" },
  STREAK_3: { name: "On a Roll!", description: "Maintain a 3-day streak on any habit.", icon: "🔥" },
  STREAK_7: { name: "Weekly Warrior", description: "Maintain a 7-day streak on any habit.", icon: "🛡️" },
  STREAK_30: { name: "Month of Mastery", description: "Maintain a 30-day streak on any habit.", icon: "🚀" },
};

const StatCard = ({ label, value }) => (
  <div className="glass-card p-4 text-center">
    <p className="text-2xl font-bold text-[var(--text-color)] drop-shadow">{value}</p>
    <p className="text-sm text-[var(--text-color-muted)]">{label}</p>
  </div>
);

const ProfilePage = ({ user, onUserUpdate }) => {
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/profile`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfileData(data.profile);
        setStats(data.stats);
        setUsername(data.profile.username);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    const body = {};
    if (username !== user.username) body.username = username;
    if (newPassword) body.newPassword = newPassword;

    if (Object.keys(body).length === 0) {
      setMessage("No changes to update.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      
      setMessage("Profile updated successfully!");
      setNewPassword('');
      onUserUpdate(data.user);
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-[var(--text-color-muted)]">Loading Profile...</div>;
  }

  if (!profileData || !stats) {
    return <div className="text-center p-8 text-red-400">Could not load profile data.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-[var(--text-color)] drop-shadow mb-2">{profileData.username}</h2>
        <p className="text-lg text-[var(--text-color-muted)] mb-4">{profileData.email}</p>
        <LevelProgressBar points={user.points} />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[var(--text-color)] drop-shadow mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Habits" value={stats.totalHabits} />
          <StatCard label="Total Completions" value={stats.totalCompletions} />
          <StatCard label="Longest Streak" value={stats.allTimeLongestStreak} />
          <StatCard label="Badges Earned" value={stats.badgesEarned} />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[var(--text-color)] drop-shadow mb-4">Badge Collection</h3>
        {user.badges && user.badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {user.badges.map(badgeId => {
              const badge = allBadges[badgeId];
              if (!badge) return null;
              return (
                <div key={badgeId} className="glass-card p-4 flex flex-col items-center text-center">
                  <span className="text-5xl mb-2">{badge.icon}</span>
                  <p className="font-bold text-[var(--text-color)]">{badge.name}</p>
                  <p className="text-xs text-[var(--text-color-muted)]">{badge.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-[var(--text-color-muted)]">No badges earned yet. Keep building habits to unlock them!</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[var(--text-color)] drop-shadow mb-4">Update Profile</h3>
        <form onSubmit={handleUpdateProfile} className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-color-muted)] mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color-muted)] mb-1">New Password (optional)</label>
            <input 
              type="password" 
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="glass-input" 
            />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="glass-button">Save Changes</button>
            {message && <p className={`text-sm ${message.includes('successfully') ? 'text-emerald-400' : 'text-red-400'}`}>{message}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
