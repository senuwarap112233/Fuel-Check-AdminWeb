import { Navigate, useLocation } from 'react-router-dom';
import {
  clearAdminSession,
  getAdminSession,
  isValidAdminSession,
} from '../../utils/session';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const session = getAdminSession();

  if (!isValidAdminSession(session)) {
    clearAdminSession();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
