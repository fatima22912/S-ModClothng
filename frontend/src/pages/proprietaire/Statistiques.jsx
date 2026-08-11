import { useEffect, useState } from 'react';
import LayoutEspacePro from '../../components/LayoutEspacePro.jsx';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formaterPrix } from '../../config.js';

const LIENS = [
  { to: '/proprietaire/dashboard', label: 'Commandes', fin: true },
  { to: '/proprietaire/produits', label: 'Produits' },
  { to: '/proprietaire/statistiques', label: 'Statistiques' },
];

export default function Statistiques() {
  const { session } = useAuth();
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api
      .proprietaireStatistiques(session.token)
      .then(setStats)
      .catch(() => setErreur('Impossible de charger les statistiques.'))
      .finally(() => setChargement(false));
  }, []);

  return (
    <LayoutEspacePro titre="Espace propriétaire" liens={LIENS}>
      <h1 className="mb-6 font-display text-xl font-bold text-gray-900">Statistiques</h1>

      {chargement && <p className="text-gray-500">Chargement…</p>}
      {erreur && <p className="text-red-600">{erreur}</p>}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Chiffre d'affaires (paiements validés)</p>
              <p className="mt-2 text-2xl font-bold text-rose-dark">{formaterPrix(stats.chiffre_affaires)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Nombre de commandes payées</p>
              <p className="mt-2 text-2xl font-bold text-rose-dark">{stats.nombre_commandes}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Produits les plus vendus</h2>
            {stats.produits_plus_vendus.length === 0 ? (
              <p className="text-sm text-gray-500">Pas encore de ventes confirmées.</p>
            ) : (
              <ul className="space-y-3">
                {stats.produits_plus_vendus.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{p.nom}</span>
                    <span className="text-gray-500">{p.quantite_vendue} vendu(s) · {formaterPrix(p.montant_genere)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </LayoutEspacePro>
  );
}
