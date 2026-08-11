const COEURS = [
  { gauche: '6%', taille: 18, delai: '0s', duree: '6.5s' },
  { gauche: '18%', taille: 12, delai: '1.2s', duree: '8s' },
  { gauche: '32%', taille: 22, delai: '2.4s', duree: '7s' },
  { gauche: '48%', taille: 14, delai: '0.6s', duree: '9s' },
  { gauche: '63%', taille: 20, delai: '3s', duree: '6s' },
  { gauche: '77%', taille: 13, delai: '1.8s', duree: '7.5s' },
  { gauche: '90%', taille: 17, delai: '2.8s', duree: '8.5s' },
];

/**
 * Petits cœurs roses en va-et-vient (clin d'œil au site de référence
 * amiraveil). Décoratif, non interactif : masqué des lecteurs d'écran.
 */
export default function CoeursFlottants({ className = '' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {COEURS.map((coeur, index) => (
        <span
          key={index}
          className="absolute bottom-0 text-rose animate-float-heart"
          style={{
            left: coeur.gauche,
            fontSize: coeur.taille,
            animationDelay: coeur.delai,
            animationDuration: coeur.duree,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
