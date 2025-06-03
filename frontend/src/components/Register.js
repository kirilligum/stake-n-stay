import React, { useState, useContext } from 'react';
import axios from 'axios'; // Using axios directly for now, will use api service later
// import { AuthContext } from '../context/AuthContext'; // If needed for redirecting after registration

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const { login } = useContext(AuthContext); // Or some other mechanism to handle post-registration

  const { username, email, password, firstName, lastName } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      // Assuming backend is running on port 3001 and accessible at /api/auth/register
      // Adjust the URL if your backend setup is different.
      const res = await axios.post('/api/auth/register', {
        username,
        email,
        password,
        firstName,
        lastName,
      });
      setSuccess(res.data.message || 'Registration successful!');
      // Optionally, redirect or log in the user automatically
      // For example, if the backend returns a token upon registration:
      // if (res.data.token) { login(res.data.token, res.data.user); }
      // history.push('/login'); // Or use Navigate from react-router-dom v6+
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      console.error('Registration error:', err.response?.data || err.message);
    }
  };

  // Basic inline styles for demonstration
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
  const successStyle = {
    color: 'green',
    margin: '10px 0',
  };


  return (
    <div style={formStyle}>
      <h2>Register</h2>
      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={username}
          onChange={onChange}
          required
          style={inputStyle}
        />
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
          placeholder="Password (min 6 characters)"
          name="password"
          value={password}
          onChange={onChange}
          minLength="6"
          required
          style={inputStyle}
        />
         <input
          type="text"
          placeholder="First Name (Optional)"
          name="firstName"
          value={firstName}
          onChange={onChange}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Last Name (Optional)"
          name="lastName"
          value={lastName}
          onChange={onChange}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Register</button>
      </form>
    </div>
  );
};

export default Register;
