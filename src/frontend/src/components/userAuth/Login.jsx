import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./userAuth.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();  // Get login function from AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://ee0scw0tha.execute-api.ap-southeast-2.amazonaws.com/dev/login",
        { username, password }
      );
      console.log("Login successful:", response.data);
      
      // Use the login function from AuthContext instead of directly setting localStorage
      login({
        userId: response.data.userId,
        username: response.data.username
      });

      navigate("/chat"); // Redirect to chat page after successful login
    } catch (err) {
      if (err.response) {
        // Server responded with an error
        setError(err.response.data.message || "Login failed. Please check your credentials.");
      } else if (err.request) {
        // Request was made but no response
        setError("Network error. Please try again.");
      } else {
        setError("Login failed. Please try again.");
      }
      console.error("Login error:", err);
    }
  };

  return (
    <div className="userAuth">
      <div className="item col-1">
        <h2>Welcome back to MesChat!</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Et, cum beatae voluptates reiciendis ducimus incidunt commodi quo odio quae! Iure, consequuntur vel? Soluta itaque placeat doloribus distinctio corporis quod molestias. Lorem ipsum dolor sit amet consectetur adipisicing elit. Est veniam saepe aut quia, architecto soluta similique consequuntur distinctio nihil dolore aspernatur, rem amet autem magni optio pariatur magnam dolores quaerat!</p>
      </div>

      <div className="seperator"></div>
      <div className="item col-2">
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
              type="text"
              placeholder="Username" 
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          <button type="submit">Login</button>
        </form>

        <div className="ref-link">
          <p>
            Don't have an account? <a href="/register">Register here</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;