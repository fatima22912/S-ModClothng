import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { usePanier } from '../../context/PanierContext.jsx';
import ImageAvecSecours from '../../components/ImageAvecSecours.jsx';
import { buildImageUrl, formaterPrix } from '../../config.js';

export default function FicheProduit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ajouterArticle } = usePanier();

  const [produit, setProduit] = useState(null);
  const [tailleChoisie, setTailleChoisie] = useState(null);
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
        const premiereTailleDisponible = donnees.variantes?.find((v) => v.quantite_stock > 0);
        setTailleChoisie(premiereTailleDisponible ?? donnees.variantes?.[0] ?? null);
      })
      .catch(() => setErreur('Ce produit est introuvable.'))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <p className="container-page py-16 text-center text-gray-500">Chargement…</p>;
  if (erreur || !produit)
    return <p className="container-page py-16 text-center text-red-600">{erreur || 'Produit introuvable.'}</p>;

  const aDesVariantes = produit.variantes && produit.variantes.length > 0;
  const enRupture = aDesVariantes && tailleChoisie && tailleChoisie.quantite_stock < 1;
  const stockInsuffisant = aDesVariantes && tailleChoisie && quantite > tailleChoisie.quantite_stock;

  function validerSelection() {
    if (aDesVariantes && !tailleChoisie) {
      setMessage('Veuillez choisir une taille.');
      return false;
    }
    if (enRupture || stockInsuffisant) {
      setMessage('Stock insuffisant pour cette taille.');
      return false;
    }
    return true;
  }

  function handleAjouterAuPanier() {
    if (!validerSelection()) return;
    ajouterArticle(produit, tailleChoisie, quantite);
    setMessage('Article ajouté au panier !');
  }

  function handleAcheterMaintenant() {
    if (!validerSelection()) return;
    ajouterArticle(produit, tailleChoisie, quantite);
    navigate('/commande');
  }

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-rose-light">
          <ImageAvecSecours
            src={buildImageUrl(produit.image_principale)}
            alt={produit.nom}
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
                {produit.variantes.map((variante) => (
                  <button
                    key={variante.id}
                    disabled={variante.quantite_stock < 1}
                    onClick={() => {
                      setTailleChoisie(variante);
                      setQuantite(1);
                      setMessage('');
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      tailleChoisie?.id === variante.id
                        ? 'border-rose bg-rose text-white'
                        : 'border-gray-300 text-gray-700 hover:border-rose'
                    } ${variante.quantite_stock < 1 ? 'cursor-not-allowed opacity-40 line-through' : ''}`}
                  >
                    {variante.taille}
                  </button>
                ))}
              </div>
              {enRupture && <p className="mt-2 text-sm text-red-600">Cette taille est en rupture de stock.</p>}
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
