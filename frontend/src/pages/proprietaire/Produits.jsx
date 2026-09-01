import { useEffect, useState } from 'react';
import LayoutEspacePro from '../../components/LayoutEspacePro.jsx';
import ImageAvecSecours from '../../components/ImageAvecSecours.jsx';
import { api, ApiError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { buildImageUrl, formaterPrix, COULEURS_SUGGEREES } from '../../config.js';

const LIENS = [
  { to: '/proprietaire/dashboard', label: 'Commandes', fin: true },
  { to: '/proprietaire/produits', label: 'Produits' },
  { to: '/proprietaire/statistiques', label: 'Statistiques' },
];

const PRODUIT_VIDE = { nom: '', description: '', prix: '', prix_promo: '', id_categorie: '', actif: true };
const TAILLES_SUGGEREES = ['XS', 'S', 'M', 'L', 'XL'];

export default function ProprietaireProduits() {
  const { session } = useAuth();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [produitEnEdition, setProduitEnEdition] = useState(null);
  const [champs, setChamps] = useState(PRODUIT_VIDE);
  const [variantes, setVariantes] = useState([{ taille: 'M', couleur: COULEURS_SUGGEREES[0].nom, quantite_stock: 0 }]);
  const [fichierImage, setFichierImage] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurFormulaire, setErreurFormulaire] = useState('');

  useEffect(() => {
    chargerTout();
  }, []);

  function chargerTout() {
    setChargement(true);
    Promise.all([api.proprietaireListerProduits(session.token), api.listerCategories()])
      .then(([p, c]) => {
        setProduits(p);
        setCategories(c);
      })
      .catch(() => setErreur('Impossible de charger les données.'))
      .finally(() => setChargement(false));
  }

  function ouvrirCreation() {
    setProduitEnEdition(null);
    setChamps(PRODUIT_VIDE);
    setVariantes([{ taille: 'M', couleur: COULEURS_SUGGEREES[0].nom, quantite_stock: 0 }]);
    setFichierImage(null);
    setErreurFormulaire('');
    setFormulaireOuvert(true);
  }

  function ouvrirEdition(produit) {
    setProduitEnEdition(produit);
    setChamps({
      nom: produit.nom,
      description: produit.description ?? '',
      prix: produit.prix,
      prix_promo: produit.prix_promo ?? '',
      id_categorie: produit.id_categorie ?? '',
      actif: !!produit.actif,
    });
    setVariantes(
      produit.variantes?.length
        ? produit.variantes.map((v) => ({ ...v, couleur: v.couleur ?? COULEURS_SUGGEREES[0].nom }))
        : [{ taille: 'M', couleur: COULEURS_SUGGEREES[0].nom, quantite_stock: 0 }]
    );
    setFichierImage(null);
    setErreurFormulaire('');
    setFormulaireOuvert(true);
  }

  function majVariante(index, champ, valeur) {
    setVariantes((v) => v.map((item, i) => (i === index ? { ...item, [champ]: valeur } : item)));
  }

  function majTailleGroupe(tailleActuelle, nouvelleTaille) {
    setVariantes((v) => v.map((item) => (item.taille === tailleActuelle ? { ...item, taille: nouvelleTaille } : item)));
  }

  function ajouterTaille() {
    const tailleLibre = TAILLES_SUGGEREES.find((t) => !variantes.some((v) => v.taille === t)) ?? '';
    setVariantes((v) => [...v, { taille: tailleLibre, couleur: COULEURS_SUGGEREES[0].nom, quantite_stock: 0 }]);
  }

  function ajouterCouleur(taille) {
    setVariantes((v) => {
      const couleursUtilisees = v.filter((item) => item.taille === taille).map((item) => item.couleur);
      const couleurLibre =
        COULEURS_SUGGEREES.find((c) => !couleursUtilisees.includes(c.nom))?.nom ?? COULEURS_SUGGEREES[0].nom;
      return [...v, { taille, couleur: couleurLibre, quantite_stock: 0 }];
    });
  }

  function retirerVariante(index) {
    setVariantes((v) => v.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnregistrement(true);
    setErreurFormulaire('');

    const donnees = {
      ...champs,
      prix: Number(champs.prix),
      prix_promo: champs.prix_promo === '' ? null : Number(champs.prix_promo),
      id_categorie: champs.id_categorie || null,
      actif: champs.actif ? 1 : 0,
      variantes: variantes
        .filter((v) => v.taille)
        .map((v) => ({ ...v, couleur: v.couleur?.trim() || null })),
    };

    try {
      let produit;
      if (produitEnEdition) {
        produit = await api.proprietaireModifierProduit(session.token, produitEnEdition.id, donnees);
      } else {
        produit = await api.proprietaireCreerProduit(session.token, donnees);
      }

      if (fichierImage) {
        const formData = new FormData();
        formData.append('image', fichierImage);
        await api.proprietaireUploaderImage(session.token, produit.id, formData);
      }

      setFormulaireOuvert(false);
      chargerTout();
    } catch (err) {
      setErreurFormulaire(err instanceof ApiError ? err.message : "Impossible d'enregistrer le produit.");
    } finally {
      setEnregistrement(false);
    }
  }

  async function handleSupprimer(produit) {
    if (!confirm(`Supprimer définitivement « ${produit.nom} » ?`)) return;
    try {
      await api.proprietaireSupprimerProduit(session.token, produit.id);
      chargerTout();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  return (
    <LayoutEspacePro titre="Espace propriétaire" liens={LIENS}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gray-900">Mes produits</h1>
        <button onClick={ouvrirCreation} className="btn-rose !px-4 !py-2 text-sm">
          + Nouveau produit
        </button>
      </div>

      {chargement && <p className="text-gray-500">Chargement…</p>}
      {erreur && <p className="text-red-600">{erreur}</p>}
      {!chargement && !erreur && produits.length === 0 && (
        <p className="text-gray-500">Vous n'avez pas encore ajouté de produit.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {produits.map((produit) => (
          <div key={produit.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="aspect-[4/3]">
              <ImageAvecSecours
                src={buildImageUrl(produit.image_principale)}
                alt={produit.nom}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="font-medium text-gray-900">{produit.nom}</p>
              <p className="text-sm text-gray-500">{produit.categorie_nom ?? 'Sans catégorie'}</p>
              {produit.prix_promo ? (
                <p className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 line-through">{formaterPrix(produit.prix)}</span>
                  <span className="font-semibold text-rose-dark">{formaterPrix(produit.prix_promo)}</span>
                </p>
              ) : (
                <p className="font-semibold text-rose-dark">{formaterPrix(produit.prix)}</p>
              )}
              {!produit.actif && <p className="text-xs font-medium text-red-600">Inactif</p>}

              <div className="mt-3 flex gap-2">
                <button onClick={() => ouvrirEdition(produit)} className="btn-rose-outline flex-1 !px-3 !py-1.5 text-sm">
                  Modifier
                </button>
                <button
                  onClick={() => handleSupprimer(produit)}
                  className="flex-1 rounded-full border-2 border-red-500 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-500 hover:text-white"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {formulaireOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-gray-900">
              {produitEnEdition ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
                <input
                  required
                  value={champs.nom}
                  onChange={(e) => setChamps((c) => ({ ...c, nom: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={champs.description}
                  onChange={(e) => setChamps((c) => ({ ...c, description: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Prix (FCFA)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={champs.prix}
                    onChange={(e) => setChamps((c) => ({ ...c, prix: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Prix promo (optionnel)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Vente flash"
                    value={champs.prix_promo}
                    onChange={(e) => setChamps((c) => ({ ...c, prix_promo: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  value={champs.id_categorie}
                  onChange={(e) => setChamps((c) => ({ ...c, id_categorie: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Aucune</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image du produit</label>
                <input type="file" accept="image/*" onChange={(e) => setFichierImage(e.target.files[0])} className="w-full text-sm" />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Tailles, couleurs et stock</label>
                  <button type="button" onClick={ajouterTaille} className="text-sm font-medium text-rose">
                    + Nouvelle taille
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.values(
                    variantes.reduce((groupes, variante, index) => {
                      const cle = variante.taille || `_sans_taille_${index}`;
                      if (!groupes[cle]) groupes[cle] = { taille: variante.taille, lignes: [] };
                      groupes[cle].lignes.push({ ...variante, index });
                      return groupes;
                    }, {})
                  ).map((groupe) => (
                    <div key={groupe.taille || groupe.lignes[0].index} className="rounded-lg border border-gray-200 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <select
                          value={groupe.taille}
                          onChange={(e) => majTailleGroupe(groupe.taille, e.target.value)}
                          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-medium"
                        >
                          <option value="">Taille</option>
                          {TAILLES_SUGGEREES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => ajouterCouleur(groupe.taille)}
                          className="text-sm font-medium text-rose"
                        >
                          + Couleur
                        </button>
                      </div>
                      <div className="space-y-2">
                        {groupe.lignes.map(({ index, couleur, quantite_stock }) => (
                          <div key={index} className="flex items-center gap-2">
                            <select
                              value={couleur ?? ''}
                              onChange={(e) => majVariante(index, 'couleur', e.target.value)}
                              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                            >
                              <option value="">Aucune couleur</option>
                              {COULEURS_SUGGEREES.map((c) => (
                                <option key={c.nom} value={c.nom}>
                                  {c.nom}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="0"
                              placeholder="Stock"
                              value={quantite_stock}
                              onChange={(e) => majVariante(index, 'quantite_stock', Number(e.target.value))}
                              className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                            />
                            <button type="button" onClick={() => retirerVariante(index)} className="text-sm text-red-600">
                              Retirer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={champs.actif}
                  onChange={(e) => setChamps((c) => ({ ...c, actif: e.target.checked }))}
                />
                Produit visible sur le site
              </label>

              {erreurFormulaire && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurFormulaire}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setFormulaireOuvert(false)} className="btn-rose-outline flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={enregistrement} className="btn-rose flex-1">
                  {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutEspacePro>
  );
}
