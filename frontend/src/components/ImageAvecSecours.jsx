import { useState } from 'react';

/**
 * <img> avec repli automatique sur un visuel de substitution si l'image
 * source est manquante ou en erreur (utile tant que les vraies photos
 * produits ne sont pas encore uploadées).
 */
export default function ImageAvecSecours({ src, alt, className }) {
  const [enErreur, setEnErreur] = useState(false);

  if (!src || enErreur) {
    return (
      <div className={`flex items-center justify-center bg-rose-light ${className ?? ''}`}>
        <svg viewBox="0 0 24 24" className="h-1/3 w-1/3 text-rose" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16m-2-2l1.5-1.5a2 2 0 012.8 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setEnErreur(true)} loading="lazy" />;
}
