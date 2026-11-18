
import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (registering) {
        const registerResponse = await fetch(
          "http://localhost:5000/login/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          }
        );

        const registerResult = await registerResponse.json();

        if (!registerResponse.ok) {
          throw new Error(registerResult.message);
        }

        alert("Librarian account created! You can now log in.");
        setRegistering(false);
        setPassword("");
        return;
      }

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      onLogin();
    } catch (error) {
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#183c30",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#fffdf7",
        padding: "40px",
        borderRadius: "18px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.2)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "42px" }}>📚</div>
          <h1 style={{ color: "#183c30", margin: "10px 0" }}>
            BookHaven
          </h1>
          <p style={{ color: "#777" }}>
            {registering
              ? "Create your librarian account"
              : "Welcome back, librarian"}
          </p>
        </div>

        <label style={{ display: "block", marginBottom: "8px" }}>
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
          placeholder="Enter username"
        />

        <label style={{ display: "block", margin: "16px 0 8px" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
          placeholder="Enter password"
        />

        <button type="submit" disabled={loading} style={{
          width: "100%",
          marginTop: "24px",
          padding: "14px",
          background: "#183c30",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}>
          {loading
            ? "Please wait..."
            : registering ? "Create Account" : "Log In"}
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          {registering
            ? "Already have an account?"
            : "Need to create an account?"}
          {" "}
          <button
            type="button"
            onClick={() => setRegistering(!registering)}
            style={{
              border: "none",
              background: "none",
              color: "#a17d3e",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {registering ? "Log in" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "7px",
  outline: "none",
  background: "white"
};

export default Login;
