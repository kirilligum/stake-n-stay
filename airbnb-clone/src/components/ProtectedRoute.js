import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// This component can be used in two ways:
// 1. As a wrapper component: <Route path="/protected" element={<ProtectedRoute><YourComponent /></ProtectedRoute>} />
//    In this case, if authenticated, it renders 'children'. Outlet is not used.
// 2. As an element for nested routes: <Route element={<ProtectedRoute />}> <Route path="/protected" element={<YourComponent />} /> </Route>
//    In this case, if authenticated, it renders <Outlet /> which then renders the matched nested route.

// We will use the Outlet approach for cleaner route definitions in App.js
function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Optional: Show a loading spinner or a blank page while auth state is being determined
    // This prevents redirecting to login before auth state is confirmed.
    return <div>Loading authentication status...</div>;
  }

  if (!currentUser) {
    // User not authenticated, redirect to login page
    // You can pass the current location to redirect back after login:
    // return <Navigate to="/login" state={{ from: location }} replace />;
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the child components via Outlet
  return <Outlet />;
}

export default ProtectedRoute;
