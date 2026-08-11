import { useEffect, useState } from 'react';
import LayoutEspacePro from '../../components/LayoutEspacePro.jsx';
import ImageAvecSecours from '../../components/ImageAvecSecours.jsx';
import { api, ApiError } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { buildImageUrl, formaterPrix } from '../../config.js';

const LIENS = [
  { to: '/admin/produits', label: 'Produits', fin: true },
  { to: '/admin/proprietaires', label: 'Propriétaires' },
];

const PRODUIT_VIDE = { nom: '', description: '', prix: '', id_categorie: '', id_proprietaire: '', actif: true };
const TAILLES_SUGGEREES = ['XS', 'S', 'M', 'L', 'XL'];

export default function AdminProduits() {
  const { session } = useAuth();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [proprietaires, setProprietaires] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [produitEnEdition, setProduitEnEdition] = useState(null);
  const [champs, setChamps] = useState(PRODUIT_VIDE);
  const [variantes, setVariantes] = useState([{ taille: 'M', quantite_stock: 0 }]);
  const [fichierImage, setFichierImage] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreurFormulaire, setErreurFormulaire] = useState('');

  useEffect(() => {
    chargerTout();
  }, []);

  function chargerTout() {
    setChargement(true);
    Promise.all([api.adminListerProduits(session.token), api.listerCategories(), api.adminListerProprietaires(session.token)])
      .then(([p, c, pr]) => {
        setProduits(p);
        setCategories(c);
        setProprietaires(pr);
      })
      .catch(() => setErreur('Impossible de charger les données.'))
      .finally(() => setChargement(false));
  }

  function ouvrirCreation() {
    setProduitEnEdition(null);
    setChamps({ ...PRODUIT_VIDE, id_proprietaire: proprietaires[0]?.id ?? '' });
    setVariantes([{ taille: 'M', quantite_stock: 0 }]);
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
      id_categorie: produit.id_categorie ?? '',
      id_proprietaire: produit.id_proprietaire,
      actif: !!produit.actif,
    });
    setVariantes(produit.variantes?.length ? produit.variantes : [{ taille: 'M', quantite_stock: 0 }]);
    setFichierImage(null);
    setErreurFormulaire('');
    setFormulaireOuvert(true);
  }

  function majVariante(index, champ, valeur) {
    setVariantes((v) => v.map((item, i) => (i === index ? { ...item, [champ]: valeur } : item)));
  }

  function ajouterVariante() {
    setVariantes((v) => [...v, { taille: '', quantite_stock: 0 }]);
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
      id_categorie: champs.id_categorie || null,
      id_proprietaire: Number(champs.id_proprietaire),
      actif: champs.actif ? 1 : 0,
      variantes: variantes.filter((v) => v.taille),
    };

    try {
      let produit;
      if (produitEnEdition) {
        produit = await api.adminModifierProduit(session.token, produitEnEdition.id, donnees);
      } else {
        produit = await api.adminCreerProduit(session.token, donnees);
      }

      if (fichierImage) {
        const formData = new FormData();
        formData.append('image', fichierImage);
        await api.adminUploaderImage(session.token, produit.id, formData);
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
      await api.adminSupprimerProduit(session.token, produit.id);
      chargerTout();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Suppression impossible.');
    }
  }

  return (
    <LayoutEspacePro titre="Espace administrateur" liens={LIENS}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-gray-900">Produits</h1>
        <button onClick={ouvrirCreation} className="btn-rose !px-4 !py-2 text-sm">
          + Nouveau produit
        </button>
      </div>

      {chargement && <p className="text-gray-500">Chargement…</p>}
      {erreur && <p className="text-red-600">{erreur}</p>}

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
              <p className="text-sm text-gray-500">{produit.nom_boutique} · {produit.categorie_nom ?? 'Sans catégorie'}</p>
              <p className="font-semibold text-rose-dark">{formaterPrix(produit.prix)}</p>
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
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Boutique propriétaire</label>
                <select
                  required
                  value={champs.id_proprietaire}
                  onChange={(e) => setChamps((c) => ({ ...c, id_proprietaire: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {proprietaires.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom_boutique}
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
                  <label className="text-sm font-medium text-gray-700">Tailles et stock</label>
                  <button type="button" onClick={ajouterVariante} className="text-sm font-medium text-rose">
                    + Ajouter
                  </button>
                </div>
                <div className="space-y-2">
                  {variantes.map((variante, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={variante.taille}
                        onChange={(e) => majVariante(index, 'taille', e.target.value)}
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      >
                        <option value="">Taille</option>
                        {TAILLES_SUGGEREES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        placeholder="Stock"
                        value={variante.quantite_stock}
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
