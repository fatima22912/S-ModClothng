import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const CLE_STOCKAGE = 'smod_auth';

function chargerSession() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    return brut ? JSON.parse(brut) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(chargerSession);

  function connecter({ token, role, utilisateur }) {
    const nouvelleSession = { token, role, utilisateur };
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(nouvelleSession));
    setSession(nouvelleSession);
  }

  function deconnecter() {
    localStorage.removeItem(CLE_STOCKAGE);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return contexte;
}
