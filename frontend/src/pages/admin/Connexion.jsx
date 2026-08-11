import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ConnexionAdmin() {
  const { session, connecter } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  if (session?.role === 'administrateur') {
    return <Navigate to="/admin/produits" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const reponse = await api.login(email, motDePasse);
      if (reponse.role !== 'administrateur') {
        setErreur("Ce compte n'est pas un compte administrateur.");
        return;
      }
      connecter(reponse);
      navigate('/admin/produits');
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Connexion impossible, veuillez réessayer.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rose-light px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-1 font-display text-xl font-bold text-rose-dark">Espace administrateur</h1>
        <p className="mb-6 text-sm text-gray-500">S'Mod Clothing</p>

        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
        <input
          required
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
        />

        {erreur && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <button type="submit" disabled={chargement} className="btn-rose w-full">
          {chargement ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
