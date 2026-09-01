import { useEffect, useState } from 'react';
import LayoutEspacePro from '../../components/LayoutEspacePro.jsx';
import { api, ApiError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formaterPrix } from '../../config.js';

const LIENS = [
  { to: '/proprietaire/dashboard', label: 'Commandes', fin: true },
  { to: '/proprietaire/produits', label: 'Produits' },
  { to: '/proprietaire/statistiques', label: 'Statistiques' },
];

const LIBELLES_STATUT_COMMANDE = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  en_preparation: 'En préparation',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};

const LIBELLES_STATUT_PAIEMENT = {
  en_attente: 'Paiement en attente',
  valide: 'Paiement validé',
  echoue: 'Paiement échoué',
};

const COULEURS_STATUT_COMMANDE = {
  en_attente: 'bg-gray-100 text-gray-700',
  confirmee: 'bg-blue-100 text-blue-700',
  en_preparation: 'bg-amber-100 text-amber-700',
  expediee: 'bg-indigo-100 text-indigo-700',
  livree: 'bg-green-100 text-green-700',
  annulee: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const { session } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [commandeOuverte, setCommandeOuverte] = useState(null);

  useEffect(() => {
    chargerCommandes();
  }, []);

  function chargerCommandes() {
    setChargement(true);
    api
      .proprietaireCommandes(session.token)
      .then(setCommandes)
      .catch(() => setErreur('Impossible de charger les commandes.'))
      .finally(() => setChargement(false));
  }

  async function changerStatut(idCommande, donnees) {
    try {
      await api.proprietaireChangerStatut(session.token, idCommande, donnees);
      chargerCommandes();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Impossible de mettre à jour le statut.');
    }
  }

  return (
    <LayoutEspacePro titre="Espace propriétaire" liens={LIENS}>
      <h1 className="mb-6 font-display text-xl font-bold text-gray-900">Commandes reçues</h1>

      {chargement && <p className="text-gray-500">Chargement…</p>}
      {erreur && <p className="text-red-600">{erreur}</p>}
      {!chargement && commandes.length === 0 && <p className="text-gray-500">Aucune commande pour le moment.</p>}

      <div className="space-y-4">
        {commandes.map((commande) => {
          const estOuverte = commandeOuverte === commande.id;
          return (
            <div key={commande.id} className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <button
                className="flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
                onClick={() => setCommandeOuverte(estOuverte ? null : commande.id)}
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    Commande n°{commande.id} — {commande.nom_client}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(commande.date_creation).toLocaleString('fr-FR')} · {commande.telephone_client}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${COULEURS_STATUT_COMMANDE[commande.statut_commande]}`}>
                    {LIBELLES_STATUT_COMMANDE[commande.statut_commande]}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${commande.statut_paiement === 'valide' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {LIBELLES_STATUT_PAIEMENT[commande.statut_paiement]}
                  </span>
                  <span className="font-semibold text-rose-dark">{formaterPrix(commande.montant_total)}</span>
                </div>
              </button>

              {estOuverte && (
                <div className="border-t p-4">
                  <ul className="mb-4 space-y-1 text-sm text-gray-600">
                    {commande.lignes.map((ligne) => (
                      <li key={ligne.id} className="flex justify-between">
                        <span>
                          {ligne.nom_produit} {(ligne.taille || ligne.couleur) && `(${[ligne.taille, ligne.couleur].filter(Boolean).join(' / ')})`} × {ligne.quantite}
                        </span>
                        <span>{formaterPrix(ligne.prix_unitaire * ligne.quantite)}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mb-4 text-sm text-gray-600">
                    Livraison : {commande.adresse_livraison}, {commande.ville}
                    {' · '}Paiement : {commande.mode_paiement === 'wave' ? 'Wave' : 'Orange Money'}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <select
                      value={commande.statut_commande}
                      onChange={(e) => changerStatut(commande.id, { statut_commande: e.target.value })}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      {Object.entries(LIBELLES_STATUT_COMMANDE).map(([valeur, libelle]) => (
                        <option key={valeur} value={valeur}>
                          {libelle}
                        </option>
                      ))}
                    </select>

                    {commande.statut_paiement !== 'valide' && (
                      <button
                        onClick={() => changerStatut(commande.id, { statut_paiement: 'valide', statut_commande: 'confirmee' })}
                        className="btn-rose !px-4 !py-2 text-sm"
                      >
                        Marquer le paiement comme reçu
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </LayoutEspacePro>
  );
}
