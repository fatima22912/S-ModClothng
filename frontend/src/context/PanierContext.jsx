import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PanierContext = createContext(null);
const CLE_STOCKAGE = 'smod_panier';

function chargerPanier() {
  try {
    const brut = sessionStorage.getItem(CLE_STOCKAGE);
    return brut ? JSON.parse(brut) : [];
  } catch {
    return [];
  }
}

export function PanierProvider({ children }) {
  const [articles, setArticles] = useState(chargerPanier);

  useEffect(() => {
    sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(articles));
  }, [articles]);

  function ajouterArticle(produit, variante, quantite = 1) {
    setArticles((precedent) => {
      const cleArticle = `${produit.id}-${variante?.id ?? 'sans-taille'}`;
      const existant = precedent.find((a) => a.cle === cleArticle);

      if (existant) {
        return precedent.map((a) =>
          a.cle === cleArticle ? { ...a, quantite: a.quantite + quantite } : a
        );
      }

      return [
        ...precedent,
        {
          cle: cleArticle,
          id_produit: produit.id,
          nom: produit.nom,
          prix: Number(produit.prix),
          image_principale: produit.image_principale,
          id_variante: variante?.id ?? null,
          taille: variante?.taille ?? null,
          quantite,
        },
      ];
    });
  }

  function modifierQuantite(cle, quantite) {
    if (quantite < 1) return;
    setArticles((precedent) => precedent.map((a) => (a.cle === cle ? { ...a, quantite } : a)));
  }

  function retirerArticle(cle) {
    setArticles((precedent) => precedent.filter((a) => a.cle !== cle));
  }

  function viderPanier() {
    setArticles([]);
  }

  const total = useMemo(
    () => articles.reduce((somme, a) => somme + a.prix * a.quantite, 0),
    [articles]
  );

  const nombreArticles = useMemo(
    () => articles.reduce((somme, a) => somme + a.quantite, 0),
    [articles]
  );

  const valeur = { articles, ajouterArticle, modifierQuantite, retirerArticle, viderPanier, total, nombreArticles };

  return <PanierContext.Provider value={valeur}>{children}</PanierContext.Provider>;
}

export function usePanier() {
  const contexte = useContext(PanierContext);
  if (!contexte) {
    throw new Error('usePanier doit être utilisé à l\'intérieur de PanierProvider');
  }
  return contexte;
}
