import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import CarteProduit from '../../components/CarteProduit.jsx';
import CoeursFlottants from '../../components/CoeursFlottants.jsx';
import { BOUTIQUE } from '../../config.js';
import logo from '../../assets/logo.jpg';

export default function Accueil() {
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .listerProduits()
      .then((donnees) => setProduits(donnees.slice(0, 8)))
      .catch(() => setProduits([]))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div>
      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-rose-light">
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain object-center opacity-25 blur-[2px]"
        />
        <div className="absolute inset-0 bg-rose-light/70" />
        <CoeursFlottants />
        <div className="container-page relative flex w-full flex-col items-center gap-8 py-20 text-center">
          <h1 className="animate-fade-in-up font-display text-4xl font-bold text-rose-dark sm:text-5xl md:text-6xl">
            Découvrez notre collection exclusive {BOUTIQUE.nom}
          </h1>
          <p className="max-w-2xl animate-fade-in-up text-lg text-gray-700 [animation-delay:150ms]">
            Des tenues élégantes et tendance pour femmes, livrées chez vous ou à récupérer à Guédiawaye.
            Paiement simple via Wave ou Orange Money.
          </p>
          <div className="flex animate-fade-in-up flex-col gap-4 [animation-delay:300ms] sm:flex-row">
            <Link to="/catalogue" className="btn-rose">
              Voir les Produits
            </Link>
            <Link to="/contact" className="btn-rose-outline">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-gray-900">Nos dernières pièces</h2>

        {chargement && <p className="text-center text-gray-500">Chargement des produits…</p>}

        {!chargement && produits.length === 0 && (
          <p className="text-center text-gray-500">Aucun produit disponible pour le moment.</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
          {produits.map((produit, index) => (
            <CarteProduit key={produit.id} produit={produit} delai={index * 70} />
          ))}
        </div>

        {produits.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/catalogue" className="btn-rose-outline">
              Voir tout le catalogue
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
