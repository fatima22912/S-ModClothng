import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RouteProtegee({ role, children }) {
  const { session } = useAuth();

  if (!session || session.role !== role) {
    const cheminConnexion = role === 'administrateur' ? '/admin/connexion' : '/proprietaire/connexion';
    return <Navigate to={cheminConnexion} replace />;
  }

  return children;
}
