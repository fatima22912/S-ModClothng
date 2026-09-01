import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { usePanier } from '../../context/PanierContext.jsx';
import PhotoProduit from '../../components/PhotoProduit.jsx';
import { buildImageUrl, formaterPrix, COULEURS_SUGGEREES } from '../../config.js';

export default function FicheProduit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ajouterArticle } = usePanier();

  const [produit, setProduit] = useState(null);
  const [tailleChoisie, setTailleChoisie] = useState(null);
  const [couleurChoisie, setCouleurChoisie] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setChargement(true);
    api
      .obtenirProduit(id)
      .then((donnees) => {
        setProduit(donnees);
        const tailles = [...new Set((donnees.variantes ?? []).map((v) => v.taille))];
        const tailleDisponible = tailles.find((t) =>
          donnees.variantes.some((v) => v.taille === t && v.quantite_stock > 0)
        );
        setTailleChoisie(tailleDisponible ?? tailles[0] ?? null);
        setCouleurChoisie(null);
      })
      .catch(() => setErreur('Ce produit est introuvable.'))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <p className="container-page py-16 text-center text-gray-500">Chargement…</p>;
  if (erreur || !produit)
    return <p className="container-page py-16 text-center text-red-600">{erreur || 'Produit introuvable.'}</p>;

  const aDesVariantes = produit.variantes && produit.variantes.length > 0;
  const tailles = aDesVariantes ? [...new Set(produit.variantes.map((v) => v.taille))] : [];
  const variantesTaille = aDesVariantes ? produit.variantes.filter((v) => v.taille === tailleChoisie) : [];
  const aDesCouleurs = variantesTaille.some((v) => v.couleur);
  const varianteChoisie = aDesCouleurs
    ? variantesTaille.find((v) => v.couleur === couleurChoisie) ?? null
    : variantesTaille[0] ?? null;

  const enRupture = aDesVariantes && varianteChoisie && varianteChoisie.quantite_stock < 1;
  const stockInsuffisant = aDesVariantes && varianteChoisie && quantite > varianteChoisie.quantite_stock;
  const produitEnStock = !aDesVariantes || produit.variantes.some((v) => v.quantite_stock > 0);

  function choisirTaille(taille) {
    setTailleChoisie(taille);
    setCouleurChoisie(null);
    setQuantite(1);
    setMessage('');
  }

  function choisirCouleur(couleur) {
    setCouleurChoisie(couleur);
    setQuantite(1);
    setMessage('');
  }

  function validerSelection() {
    if (aDesVariantes && !tailleChoisie) {
      setMessage('Veuillez choisir une taille.');
      return false;
    }
    if (aDesVariantes && aDesCouleurs && !couleurChoisie) {
      setMessage('Veuillez choisir une couleur.');
      return false;
    }
    if (aDesVariantes && !varianteChoisie) {
      setMessage("Cette combinaison n'est pas disponible.");
      return false;
    }
    if (enRupture || stockInsuffisant) {
      setMessage('Stock insuffisant pour cette option.');
      return false;
    }
    return true;
  }

  function handleAjouterAuPanier() {
    if (!validerSelection()) return;
    ajouterArticle(produit, varianteChoisie, quantite);
    setMessage('Article ajouté au panier !');
  }

  function handleAcheterMaintenant() {
    if (!validerSelection()) return;
    ajouterArticle(produit, varianteChoisie, quantite);
    navigate('/commande');
  }

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-rose-light">
          <PhotoProduit
            src={buildImageUrl(produit.image_principale)}
            alt={produit.nom}
            enStock={produitEnStock}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          {produit.categorie_nom && <p className="text-sm uppercase tracking-wide text-rose">{produit.categorie_nom}</p>}
          <h1 className="mt-1 font-display text-2xl font-bold text-gray-900 sm:text-3xl">{produit.nom}</h1>
          <p className="mt-3 text-2xl font-semibold text-rose-dark">{formaterPrix(produit.prix)}</p>

          {produit.description && <p className="mt-4 text-gray-600">{produit.description}</p>}

          {aDesVariantes && (
            <div className="mt-6">
              <p className="mb-2 font-medium text-gray-800">Taille</p>
              <div className="flex flex-wrap gap-2">
                {tailles.map((taille) => {
                  const dispoPourTaille = produit.variantes.some((v) => v.taille === taille && v.quantite_stock > 0);
                  return (
                    <button
                      key={taille}
                      disabled={!dispoPourTaille}
                      onClick={() => choisirTaille(taille)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        tailleChoisie === taille
                          ? 'border-rose bg-rose text-white'
                          : 'border-gray-300 text-gray-700 hover:border-rose'
                      } ${!dispoPourTaille ? 'cursor-not-allowed opacity-40 line-through' : ''}`}
                    >
                      {taille}
                    </button>
                  );
                })}
              </div>

              {tailleChoisie && aDesCouleurs && (
                <div className="mt-4">
                  <p className="mb-2 font-medium text-gray-800">Couleur</p>
                  <div className="flex flex-wrap gap-3">
                    {variantesTaille.map((variante) => {
                      const hex = COULEURS_SUGGEREES.find((c) => c.nom === variante.couleur)?.hex ?? '#D1D5DB';
                      const selectionnee = couleurChoisie === variante.couleur;
                      const indisponible = variante.quantite_stock < 1;
                      return (
                        <button
                          key={variante.id}
                          type="button"
                          title={variante.couleur}
                          aria-label={variante.couleur}
                          disabled={indisponible}
                          onClick={() => choisirCouleur(variante.couleur)}
                          className={`h-9 w-9 rounded-full border-2 transition ${
                            selectionnee ? 'border-rose ring-2 ring-rose ring-offset-2' : 'border-gray-300'
                          } ${indisponible ? 'cursor-not-allowed opacity-30' : ''}`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {enRupture && <p className="mt-2 text-sm text-red-600">Cette option est en rupture de stock.</p>}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <p className="font-medium text-gray-800">Quantité</p>
            <div className="flex items-center rounded-lg border border-gray-300">
              <button
                className="px-3 py-1.5 text-lg text-gray-600"
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-8 text-center">{quantite}</span>
              <button className="px-3 py-1.5 text-lg text-gray-600" onClick={() => setQuantite((q) => q + 1)}>
                +
              </button>
            </div>
          </div>

          {message && <p className="mt-4 text-sm font-medium text-rose-dark">{message}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAcheterMaintenant} disabled={enRupture} className="btn-rose">
              Acheter maintenant
            </button>
            <button onClick={handleAjouterAuPanier} disabled={enRupture} className="btn-rose-outline">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
