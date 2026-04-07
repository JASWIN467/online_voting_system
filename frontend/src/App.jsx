import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Elections from './pages/Elections';
import ElectionDetails from './pages/ElectionDetails';
import MyVotes from './pages/MyVotes';
import AdminDashboard from './pages/AdminDashboard';
import AdminChartsDashboard from './pages/AdminChartsDashboard';
import AdminElectionAnalytics from './pages/AdminElectionAnalytics';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/elections" 
            element={
              <ProtectedRoute role="user">
                <Elections />
              </ProtectedRoute>
            } 
          />

          <Route path="/dashboard" element={<Navigate to="/elections" replace />} />

          <Route
            path="/election/:id"
            element={
              <ProtectedRoute role="user">
                <ElectionDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-votes"
            element={
              <ProtectedRoute role="user">
                <MyVotes />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/charts" 
            element={
              <ProtectedRoute role="admin">
                <AdminChartsDashboard />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/admin/elections/:id/analytics"
            element={
              <ProtectedRoute role="admin">
                <AdminElectionAnalytics />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
