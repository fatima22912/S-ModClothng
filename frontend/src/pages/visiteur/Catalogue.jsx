import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import CarteProduit from '../../components/CarteProduit.jsx';

export default function Catalogue() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorieActive, setCategorieActive] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    api.listerCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setChargement(true);
    setErreur('');
    api
      .listerProduits({ categorie: categorieActive })
      .then(setProduits)
      .catch(() => setErreur('Impossible de charger les produits pour le moment.'))
      .finally(() => setChargement(false));
  }, [categorieActive]);

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 animate-fade-in-up font-display text-2xl font-bold text-gray-900">Catalogue</h1>

      <div className="mb-8 flex animate-fade-in-up flex-wrap gap-2 [animation-delay:100ms]">
        <button
          onClick={() => setCategorieActive(null)}
          className={`rounded-full px-4 py-2 font-display text-sm font-medium tracking-wide shadow-sm transition ${
            categorieActive === null
              ? 'bg-rose text-white shadow-rose/30'
              : 'bg-rose-light text-rose-dark shadow-none hover:bg-rose/20'
          }`}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategorieActive(cat.id)}
            className={`rounded-full px-4 py-2 font-display text-sm font-medium tracking-wide shadow-sm transition ${
              categorieActive === cat.id
                ? 'bg-rose text-white shadow-rose/30'
                : 'bg-rose-light text-rose-dark shadow-none hover:bg-rose/20'
            }`}
          >
            {cat.nom}
          </button>
        ))}
      </div>

      {chargement && <p className="text-center text-gray-500">Chargement…</p>}
      {erreur && <p className="text-center text-red-600">{erreur}</p>}

      {!chargement && !erreur && produits.length === 0 && (
        <p className="text-center text-gray-500">Aucun produit ne correspond à cette catégorie.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
        {produits.map((produit, index) => (
          <CarteProduit key={produit.id} produit={produit} delai={(index % 12) * 60} />
        ))}
      </div>
    </div>
  );
}
