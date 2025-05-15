import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./userAuth.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://ee0scw0tha.execute-api.ap-southeast-2.amazonaws.com/dev/register",
        { username, password, email }
      );
      console.log("Registration successful:", response.data);
      navigate("/login"); // Redirect to login page after successful registration
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", err);
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
              <h2>Create an Account !</h2>
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
              type="email"
              placeholder="Email" 
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit">Register</button>
        </form>
        <div className="ref-link">
          <p>
            Already have an account? <a href="/login">Login here</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;