import { Navigate } from 'react-router-dom';
import { auth } from '../api/client';

export default function ProtectedRoute({ children }) {
  if (!auth.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}