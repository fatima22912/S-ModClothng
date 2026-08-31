import { Link } from 'react-router-dom';
import PhotoProduit from './PhotoProduit.jsx';
import { buildImageUrl, formaterPrix } from '../config.js';

export default function CarteProduit({ produit, delai = 0 }) {
  const enStock =
    produit.stock_total === undefined || Number(produit.nb_variantes) === 0 || Number(produit.stock_total) > 0;

  return (
    <Link
      to={`/produits/${produit.id}`}
      style={{ animationDelay: `${delai}ms` }}
      className="group block animate-fade-in-up overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-rose/10"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <PhotoProduit
          src={buildImageUrl(produit.image_principale)}
          alt={produit.nom}
          enStock={enStock}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="absolute right-3 top-3 flex h-8 w-8 -translate-y-2 items-center justify-center rounded-full bg-white/90 text-rose opacity-0 shadow transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          ♥
        </span>
      </div>
      <div className="p-4">
        {produit.categorie_nom && (
          <p className="text-xs uppercase tracking-wide text-rose">{produit.categorie_nom}</p>
        )}
        <h3 className="mt-1 truncate font-display text-base font-semibold text-gray-900 transition group-hover:text-rose-dark">
          {produit.nom}
        </h3>
        <p className="mt-1 font-semibold text-rose-dark">{formaterPrix(produit.prix)}</p>
      </div>
    </Link>
  );
}
