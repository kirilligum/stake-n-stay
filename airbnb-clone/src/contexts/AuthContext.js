import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebase'; // Adjust path as necessary
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'; // Renamed signOut to avoid conflict

// Create the context
const AuthContext = createContext();

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth state loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Auth state determined
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Sign out function
  const logout = () => {
    return firebaseSignOut(auth);
  };

  // Value provided to child components
  const value = {
    currentUser,
    loading, // Provide loading state for components that need to wait for auth
    logout,
    // Add other auth functions like login, signup if you want them in context,
    // though they are often called directly from components.
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {/* Render children only when not loading to prevent flicker or premature access to currentUser */}
    </AuthContext.Provider>
  );
}
