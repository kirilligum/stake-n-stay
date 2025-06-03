import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Adjust if your backend URL is different
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Property Service Functions ---
export const getProperties = (params) => {
  return api.get('/properties', { params });
};
export const getPropertyById = (id) => {
  return api.get(`/properties/${id}`);
};
export const createProperty = (data) => {
  return api.post('/properties', data);
};
export const updateProperty = (id, data) => {
  return api.put(`/properties/${id}`, data);
};
export const deleteProperty = (id) => {
  return api.delete(`/properties/${id}`);
};

// --- Booking Service Functions ---

/**
 * Create a new booking.
 * @param {object} bookingData - Data for the booking (property_id, start_date, end_date, etc.)
 * @returns {Promise<AxiosResponse<any>>}
 */
export const createBooking = (bookingData) => {
  return api.post('/bookings', bookingData);
};

/**
 * Get all bookings for the current authenticated user.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getMyBookings = () => {
  return api.get('/bookings/my-bookings');
};

/**
 * Cancel a booking by its ID.
 * @param {string|number} bookingId - The ID of the booking to cancel.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const cancelBooking = (bookingId) => {
  return api.put(`/bookings/${bookingId}/cancel`);
};

/**
 * Get a specific booking by its ID. (Useful if building a separate booking detail page)
 * @param {string|number} bookingId - The ID of the booking.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getBookingById = (bookingId) => {
  return api.get(`/bookings/${bookingId}`);
};


// Optional: Global error handling for responses (e.g., 401 Unauthorized)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // This could trigger a logout action in AuthContext
//       // For example: store.dispatch(authActions.logout());
//       // Or emit an event that App.js listens to for logging out.
//       console.error("Unauthorized access - 401. Consider global logout.");
//       // window.location.href = '/login'; // Avoid direct manipulation if using React Router
//     }
//     return Promise.reject(error);
//   }
// );

export default api; // Export the configured instance
// Components can also import the named functions like createBooking, getMyBookings etc.
// For this subtask, components were written to use `api.post`, `api.get` etc.
// So `export default api` is primary. The named exports are for potential future refactor.
