import React, { useState, useEffect, useCallback } from 'react';

// Basic styling (can be moved to a .css file and imported)
const styles = {
  container: { fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto', padding: '20px' },
  form: { marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' },
  input: { display: 'block', width: 'calc(100% - 22px)', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px' },
  button: { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '10px', marginTop: '5px' },
  pre: { backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '3px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '150px', overflowY: 'auto' },
  error: { color: 'red', marginBottom: '10px'},
  success: { color: 'green', marginBottom: '10px'},
  propertyList: { listStyle: 'none', padding: 0 },
  propertyItem: { border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px', backgroundColor: '#fff' },
  sectionTitle: { marginTop: '30px', borderBottom: '2px solid #007bff', paddingBottom: '5px', marginBottom: '15px' },
};

function App() {
  // Registration state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMessage, setRegMessage] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  // Auth state - userInfo now holds the JWT payload which includes role
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Will store decoded JWT payload
  const [profileMessage, setProfileMessage] = useState('');

  // Property state
  const [properties, setProperties] = useState([]);
  const [propertyMessage, setPropertyMessage] = useState('');
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyDescription, setNewPropertyDescription] = useState('');
  const [newPropertyLocation, setNewPropertyLocation] = useState('');
  const [newPropertyPrice, setNewPropertyPrice] = useState('');


  const handleRegister = async (e) => {
    e.preventDefault();
    setRegMessage('Registering...');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setRegMessage(`Registered: ${data.message} (User ID: ${data.userId})`);
        setRegEmail('');
        setRegPassword('');
      } else {
        setRegMessage(`Registration Error: ${data.error || response.statusText}`);
      }
    } catch (error) {
      setRegMessage(`Registration Failed: ${error.message}`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage('Logging in...');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        setAuthToken(data.token);
        // Decode JWT to get user info including role (simplified client-side decoding)
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          setCurrentUser(payload);
          setLoginMessage('Login Successful!');
          fetchProperties(); // Fetch properties on login
        } catch (e) {
          console.error("Error decoding token:", e);
          setCurrentUser({ email: loginEmail, role: 'user' }); // Fallback, ideally get from /me
          setLoginMessage('Login Successful! (Could not parse token for role)');
        }
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setAuthToken(null);
        setCurrentUser(null);
        setLoginMessage(`Login Error: ${data.error || response.statusText}`);
      }
    } catch (error) {
      setAuthToken(null);
      setCurrentUser(null);
      setLoginMessage(`Login Failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setLoginMessage('');
    setProfileMessage('');
    setProperties([]); // Clear properties on logout
    setPropertyMessage('');
  };

  const handleFetchProfile = async () => {
    if (!authToken) {
      setProfileMessage('You must be logged in to fetch profile.');
      return;
    }
    setProfileMessage('Fetching profile...');
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user); // Backend returns { user: payload }
        setProfileMessage('Profile fetched/refreshed successfully.');
      } else {
        setProfileMessage(`Error fetching profile: ${data.error || response.statusText}`);
      }
    } catch (error) {
      setProfileMessage(`Fetch profile failed: ${error.message}`);
    }
  };

  // Fetch Properties
  const fetchProperties = useCallback(async () => {
    setPropertyMessage('Fetching properties...');
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      if (response.ok) {
        setProperties(data.properties || []);
        setPropertyMessage(data.properties && data.properties.length > 0 ? '' : 'No properties found.');
      } else {
        setPropertyMessage(`Error fetching properties: ${data.error || response.statusText}`);
      }
    } catch (error) {
      setPropertyMessage(`Fetch properties failed: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    fetchProperties(); // Fetch properties on initial component mount
  }, [fetchProperties]);

  // Create Property
  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') {
      setPropertyMessage('Error: Only admins can create properties.');
      return;
    }
    if (!newPropertyName || !newPropertyDescription || !newPropertyLocation || !newPropertyPrice) {
        setPropertyMessage('Error: All property fields are required.');
        return;
    }
    setPropertyMessage('Creating property...');
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newPropertyName,
          description: newPropertyDescription,
          location: newPropertyLocation,
          price_per_night_points: parseInt(newPropertyPrice, 10),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPropertyMessage(`Property Created: ${data.property.name}`);
        setNewPropertyName('');
        setNewPropertyDescription('');
        setNewPropertyLocation('');
        setNewPropertyPrice('');
        fetchProperties(); // Refresh properties list
      } else {
        setPropertyMessage(`Error creating property: ${data.error || response.statusText}`);
      }
    } catch (error) {
      setPropertyMessage(`Create property failed: ${error.message}`);
    }
  };


  return (
    <div style={styles.container}>
      <h1>Welcome to Stake 'n' Stay</h1>

      {!authToken ? (
        <>
          {/* Registration Form */}
          <form onSubmit={handleRegister} style={styles.form}>
            <h2 style={styles.sectionTitle}>Register</h2>
            <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required style={styles.input} />
            <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required style={styles.input} />
            <button type="submit" style={styles.button}>Register</button>
            {regMessage && <p style={regMessage.includes('Error') ? styles.error : styles.success}>{regMessage}</p>}
          </form>

          {/* Login Form */}
          <form onSubmit={handleLogin} style={styles.form}>
            <h2 style={styles.sectionTitle}>Login</h2>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={styles.input} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={styles.input} />
            <button type="submit" style={styles.button}>Login</button>
            {loginMessage && <p style={loginMessage.includes('Error') ? styles.error : styles.success}>{loginMessage}</p>}
          </form>
        </>
      ) : (
        <div style={styles.form}>
          <h2 style={styles.sectionTitle}>Welcome, {currentUser?.email} (Role: {currentUser?.role})!</h2>
          {authToken && <p><strong>Token:</strong> <pre style={styles.pre}>{authToken}</pre></p>}

          <button onClick={handleFetchProfile} style={styles.button}>Fetch/Refresh Profile</button>
          <button onClick={handleLogout} style={styles.button}>Logout</button>
          {profileMessage && <p style={profileMessage.includes('Error') ? styles.error : styles.success}>{profileMessage}</p>}
          {currentUser && typeof currentUser === 'object' && (
            <div>
              <strong>User Info (from JWT/profile):</strong>
              <pre style={styles.pre}>{JSON.stringify(currentUser, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Property Listing */}
      <div style={{marginTop: '30px'}}>
        <h2 style={styles.sectionTitle}>Available Properties</h2>
        {propertyMessage && <p style={propertyMessage.includes('Error') ? styles.error : {}}>{propertyMessage}</p>}
        {properties.length > 0 ? (
          <ul style={styles.propertyList}>
            {properties.map(prop => (
              <li key={prop.id} style={styles.propertyItem}>
                <h3>{prop.name}</h3>
                <p>{prop.description}</p>
                <p><strong>Location:</strong> {prop.location}</p>
                <p><strong>Price:</strong> {prop.price_per_night_points} points/night</p>
                <p><small>Owner ID: {prop.owner_id}</small></p>
              </li>
            ))}
          </ul>
        ) : (
          !propertyMessage.includes('Error') && <p>No properties currently listed.</p>
        )}
      </div>

      {/* Create Property Form (Admin Only) */}
      {currentUser && currentUser.role === 'admin' && (
        <form onSubmit={handleCreateProperty} style={styles.form}>
          <h2 style={styles.sectionTitle}>Create New Property (Admin)</h2>
          <input type="text" placeholder="Property Name" value={newPropertyName} onChange={(e) => setNewPropertyName(e.target.value)} required style={styles.input} />
          <textarea placeholder="Description" value={newPropertyDescription} onChange={(e) => setNewPropertyDescription(e.target.value)} required style={{...styles.input, height: '60px'}} />
          <input type="text" placeholder="Location" value={newPropertyLocation} onChange={(e) => setNewPropertyLocation(e.target.value)} required style={styles.input} />
          <input type="number" placeholder="Price per night (points)" value={newPropertyPrice} onChange={(e) => setNewPropertyPrice(e.target.value)} required style={styles.input} />
          <button type="submit" style={styles.button}>Create Property</button>
        </form>
      )}
    </div>
  );
}

export default App;
