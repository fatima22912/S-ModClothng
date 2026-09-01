import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { usePanier } from '../../context/PanierContext.jsx';
import { api, ApiError } from '../../services/api.js';
import { BOUTIQUE, formaterPrix } from '../../config.js';
import logoOrangeMoney from '../../assets/orange-money-logo.jpg';
import logoWave from '../../assets/wave-logo.jpg';

const CHAMPS_INITIAUX = {
  nom_client: '',
  telephone_client: '',
  mode_livraison: 'livraison',
  adresse_livraison: '',
  ville: '',
  mode_paiement: 'wave',
};

export default function Commande() {
  const { articles, total, viderPanier } = usePanier();
  const navigate = useNavigate();

  const [champs, setChamps] = useState(CHAMPS_INITIAUX);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  if (articles.length === 0) {
    return <Navigate to="/panier" replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'telephone_client') {
      setChamps((c) => ({ ...c, [name]: value.replace(/[^0-9\s]/g, '') }));
      return;
    }
    setChamps((c) => ({ ...c, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');

    if (!/^[0-9\s]+$/.test(champs.telephone_client.trim())) {
      setErreur('Le numéro de téléphone ne doit contenir que des chiffres.');
      return;
    }

    setEnvoiEnCours(true);

    const panier = articles.map((a) => ({
      id_produit: a.id_produit,
      id_variante: a.id_variante,
      quantite: a.quantite,
    }));

    try {
      const commande = await api.creerCommande({ ...champs, panier });

      const infosPaiement =
        champs.mode_paiement === 'wave'
          ? await api.infosPaiementWave(commande.id)
          : await api.infosPaiementOrangeMoney(commande.id);

      if (champs.mode_paiement === 'wave' && infosPaiement.lien_paiement) {
        window.open(infosPaiement.lien_paiement, '_blank', 'noopener,noreferrer');
      }

      viderPanier();
      navigate('/commande/confirmation', { state: { commande, infosPaiement } });
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Une erreur est survenue, veuillez réessayer.');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-gray-900">Finaliser ma commande</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nom complet</label>
            <input
              required
              name="nom_client"
              value={champs.nom_client}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Numéro de téléphone</label>
            <input
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9\s]+"
              name="telephone_client"
              placeholder="77 000 00 00"
              value={champs.telephone_client}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Comment souhaitez-vous récupérer votre commande ?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-lg border p-3 text-sm ${
                  champs.mode_livraison === 'livraison' ? 'border-rose bg-rose-light' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode_livraison"
                  value="livraison"
                  checked={champs.mode_livraison === 'livraison'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Livraison à mon adresse
              </label>
              <label
                className={`cursor-pointer rounded-lg border p-3 text-sm ${
                  champs.mode_livraison === 'retrait_boutique' ? 'border-rose bg-rose-light' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode_livraison"
                  value="retrait_boutique"
                  checked={champs.mode_livraison === 'retrait_boutique'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Retrait à {BOUTIQUE.adresseRetrait}
              </label>
            </div>
          </div>

          {champs.mode_livraison === 'livraison' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Adresse de livraison</label>
                <input
                  required
                  name="adresse_livraison"
                  value={champs.adresse_livraison}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ville</label>
                <input
                  required
                  name="ville"
                  value={champs.ville}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
                />
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Mode de paiement</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${
                  champs.mode_paiement === 'wave' ? 'border-rose bg-rose-light' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode_paiement"
                  value="wave"
                  checked={champs.mode_paiement === 'wave'}
                  onChange={handleChange}
                />
                <img src={logoWave} alt="Wave" className="h-6 w-6 rounded object-contain" />
                <span className="font-semibold text-[#1DC8F2]">Wave</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${
                  champs.mode_paiement === 'orange_money' ? 'border-rose bg-rose-light' : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode_paiement"
                  value="orange_money"
                  checked={champs.mode_paiement === 'orange_money'}
                  onChange={handleChange}
                />
                <img src={logoOrangeMoney} alt="Orange Money" className="h-6 w-auto object-contain" />
                <span>Orange Money</span>
              </label>
            </div>
          </div>

          {erreur && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}

          <button type="submit" disabled={envoiEnCours} className="btn-rose w-full">
            {envoiEnCours ? 'Envoi en cours…' : `Confirmer ma commande — ${formaterPrix(total)}`}
          </button>
        </form>

        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Récapitulatif</h2>
          <ul className="space-y-2 text-sm">
            {articles.map((a) => (
              <li key={a.cle} className="flex justify-between text-gray-600">
                <span>
                  {a.nom} {a.taille && `(${a.taille})`} × {a.quantite}
                </span>
                <span>{formaterPrix(a.prix * a.quantite)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 font-semibold text-rose-dark">
            <span>Total</span>
            <span>{formaterPrix(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
