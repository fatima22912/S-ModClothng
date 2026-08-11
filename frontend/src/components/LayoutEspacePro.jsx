import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LayoutEspacePro({ titre, liens, children }) {
  const { session, deconnecter } = useAuth();
  const navigate = useNavigate();

  function handleDeconnexion() {
    deconnecter();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold text-rose-dark">{titre}</p>
            {session?.utilisateur?.nom && (
              <p className="text-xs text-gray-500">Connecté(e) en tant que {session.utilisateur.nom}</p>
            )}
          </div>
          <button onClick={handleDeconnexion} className="btn-rose-outline !px-4 !py-2 text-sm">
            Déconnexion
          </button>
        </div>
        <nav className="container-page flex gap-6 overflow-x-auto pb-3 text-sm font-medium">
          {liens.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              end={lien.fin}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 pb-1 ${isActive ? 'border-rose text-rose' : 'border-transparent text-gray-600 hover:text-rose'}`
              }
            >
              {lien.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
