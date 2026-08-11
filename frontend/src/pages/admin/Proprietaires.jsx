import { useEffect, useState } from 'react';
import LayoutEspacePro from '../../components/LayoutEspacePro.jsx';
import { api, ApiError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const LIENS = [
  { to: '/admin/produits', label: 'Produits', fin: true },
  { to: '/admin/proprietaires', label: 'Propriétaires' },
];

const CHAMPS_VIDES = { nom_boutique: '', nom: '', email: '', mot_de_passe: '', telephone: '', telephone_2: '' };

export default function AdminProprietaires() {
  const { session } = useAuth();
  const [proprietaires, setProprietaires] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [champs, setChamps] = useState(CHAMPS_VIDES);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurFormulaire, setErreurFormulaire] = useState('');
  const [derniersIdentifiants, setDerniersIdentifiants] = useState(null);

  useEffect(() => {
    chargerListe();
  }, []);

  function chargerListe() {
    setChargement(true);
    api
      .adminListerProprietaires(session.token)
      .then(setProprietaires)
      .catch(() => setErreur('Impossible de charger les propriétaires.'))
      .finally(() => setChargement(false));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnregistrement(true);
    setErreurFormulaire('');

    try {
      await api.adminCreerProprietaire(session.token, champs);
      setDerniersIdentifiants({ email: champs.email, mot_de_passe: champs.mot_de_passe });
      setChamps(CHAMPS_VIDES);
      setFormulaireOuvert(false);
      chargerListe();
    } catch (err) {
      setErreurFormulaire(err instanceof ApiError ? err.message : 'Impossible de créer ce compte.');
    } finally {
      setEnregistrement(false);
    }
  }

  async function handleSupprimer(proprietaire) {
    if (!confirm(`Supprimer le compte de « ${proprietaire.nom_boutique} » ? Ses produits seront aussi supprimés.`)) return;
    try {
      await api.adminSupprimerProprietaire(session.token, proprietaire.id);
      chargerListe();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  return (
    <LayoutEspacePro titre="Espace administrateur" liens={LIENS}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gray-900">Propriétaires</h1>
        <button onClick={() => { setFormulaireOuvert(true); setDerniersIdentifiants(null); }} className="btn-rose !px-4 !py-2 text-sm">
          + Nouveau propriétaire
        </button>
      </div>

      {derniersIdentifiants && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Compte créé. Transmettez ces identifiants au propriétaire : <br />
          <strong>Email :</strong> {derniersIdentifiants.email} — <strong>Mot de passe :</strong> {derniersIdentifiants.mot_de_passe}
        </div>
      )}

      {chargement && <p className="text-gray-500">Chargement…</p>}
      {erreur && <p className="text-red-600">{erreur}</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-rose-light text-rose-dark">
            <tr>
              <th className="px-4 py-3">Boutique</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {proprietaires.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium text-gray-900">{p.nom_boutique}</td>
                <td className="px-4 py-3">{p.nom}</td>
                <td className="px-4 py-3">{p.email}</td>
                <td className="px-4 py-3">{p.telephone}{p.telephone_2 ? ` / ${p.telephone_2}` : ''}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleSupprimer(p)} className="text-sm font-medium text-red-600 hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formulaireOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-gray-900">Nouveau propriétaire</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nom de la boutique</label>
                <input
                  required
                  value={champs.nom_boutique}
                  onChange={(e) => setChamps((c) => ({ ...c, nom_boutique: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nom du responsable</label>
                <input
                  required
                  value={champs.nom}
                  onChange={(e) => setChamps((c) => ({ ...c, nom: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  required
                  type="email"
                  value={champs.email}
                  onChange={(e) => setChamps((c) => ({ ...c, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe (min. 8 caractères)</label>
                <input
                  required
                  minLength={8}
                  type="text"
                  value={champs.mot_de_passe}
                  onChange={(e) => setChamps((c) => ({ ...c, mot_de_passe: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    required
                    value={champs.telephone}
                    onChange={(e) => setChamps((c) => ({ ...c, telephone: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone 2 (optionnel)</label>
                  <input
                    value={champs.telephone_2}
                    onChange={(e) => setChamps((c) => ({ ...c, telephone_2: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {erreurFormulaire && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurFormulaire}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setFormulaireOuvert(false)} className="btn-rose-outline flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={enregistrement} className="btn-rose flex-1">
                  {enregistrement ? 'Création…' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutEspacePro>
  );
}
