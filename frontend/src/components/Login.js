import React, { useState, useContext } from 'react';
import axios from 'axios'; // Using axios directly for now
import { AuthContext } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom'; // For redirection

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  // const navigate = useNavigate(); // For redirecting after login

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Adjust URL if backend is on a different port or path
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.token && res.data.user) {
        login(res.data.token, res.data.user); // Update AuthContext
        // navigate('/'); // Redirect to home page or dashboard
      } else {
        setError('Login failed: No token or user data received.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      console.error('Login error:', err.response?.data || err.message);
    }
  };

  // Basic inline styles (similar to Register component for consistency)
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    margin: 'auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  };
  const inputStyle = {
    margin: '10px 0',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };
  const buttonStyle = {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };
  const errorStyle = {
    color: 'red',
    margin: '10px 0',
  };

  return (
    <div style={formStyle}>
      <h2>Login</h2>
      {error && <p style={errorStyle}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          name="email"
          value={email}
          onChange={onChange}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          minLength="6"
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </div>
  );
};

export default Login;
