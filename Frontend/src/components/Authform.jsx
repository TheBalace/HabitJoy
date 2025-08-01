import { useState } from "react";

const AuthForm = ({ type = "login", onSubmit }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = { email, password };
    if (type === "signup") {
      formData.username = username;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === "signup" && (
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="glass-input"
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="glass-input"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="glass-input"
      />

      <button
        type="submit"
        className="w-full glass-button"
      >
        {type === "login" ? "Login" : "Signup"}
      </button>
    </form>
  );
};

export default AuthForm;
