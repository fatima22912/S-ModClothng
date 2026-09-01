import { Link, useNavigate } from 'react-router-dom';
import { usePanier } from '../../context/PanierContext.jsx';
import ImageAvecSecours from '../../components/ImageAvecSecours.jsx';
import { buildImageUrl, formaterPrix } from '../../config.js';

export default function Panier() {
  const { articles, modifierQuantite, retirerArticle, total } = usePanier();
  const navigate = useNavigate();

  if (articles.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg text-gray-600">Votre panier est vide.</p>
        <Link to="/catalogue" className="btn-rose">
          Découvrir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-gray-900">Mon panier</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {articles.map((article) => (
            <div key={article.cle} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg">
                <ImageAvecSecours
                  src={buildImageUrl(article.image_principale)}
                  alt={article.nom}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-medium text-gray-900">{article.nom}</p>
                  {article.taille && (
                    <p className="text-sm text-gray-500">
                      Taille : {article.taille}
                      {article.couleur && ` · Couleur : ${article.couleur}`}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-rose-dark">{formaterPrix(article.prix)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      className="px-2.5 py-1 text-gray-600"
                      onClick={() => modifierQuantite(article.cle, article.quantite - 1)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{article.quantite}</span>
                    <button
                      className="px-2.5 py-1 text-gray-600"
                      onClick={() => modifierQuantite(article.cle, article.quantite + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => retirerArticle(article.cle)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-rose-dark">{formaterPrix(total)}</span>
          </div>
          <button onClick={() => navigate('/commande')} className="btn-rose mt-6 w-full">
            Passer la commande
          </button>
          <Link to="/catalogue" className="mt-3 block text-center text-sm text-gray-600 hover:text-rose">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
