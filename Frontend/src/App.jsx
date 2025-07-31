import { useState, useEffect } from "react";
import AuthForm from "./components/Authform"; 
import HabitList from "./components/HabitList";
import AuroraBackground from "./components/AuroraBackground";
import { API_BASE_URL } from "./api";

const App = () => {
  const [authType, setAuthType] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const handleAuthSubmit = async (formData) => {
    setLoading(true);
    setError("");
    const url = `${API_BASE_URL}/api/auth/${authType}`;
    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData), });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || "Something went wrong"); }
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) { // --- THE FIX: Added the missing curly braces ---
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const switchAuthType = (type) => {
    setAuthType(type);
    setError("");
  };

  return (
    <div className="h-screen w-full p-4 sm:p-6 lg:p-8">
      <AuroraBackground type={token ? 'blobs' : 'gradient'} />

      {token ? (
        <div className="w-full max-w-7xl mx-auto h-full">
            <HabitList 
              user={user} 
              onUserUpdate={handleUserUpdate} 
              onLogout={handleLogout}
            />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-md solid-card p-6 sm:p-8">
                <h1 className="text-5xl font-bold text-center mb-8 drop-shadow-md gradient-text">
                    HabitJoy
                </h1>
                <AuthForm type={authType} onSubmit={handleAuthSubmit} />
                {error && <p className="text-red-400 text-center mt-2">{error}</p>}
                <p className="text-center text-sm mt-6 text-[var(--text-color-muted)]">
                    {authType === "login" ? (
                    <> Don’t have an account?{" "} <button onClick={() => switchAuthType("signup")} className="font-semibold underline hover:opacity-80 transition" disabled={loading}> Signup </button> </>
                    ) : (
                    <> Already have an account?{" "} <button onClick={() => switchAuthType("login")} className="font-semibold underline hover:opacity-80 transition" disabled={loading}> Login </button> </>
                    )}
                </p>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
