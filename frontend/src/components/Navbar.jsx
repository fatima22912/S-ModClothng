import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { usePanier } from '../context/PanierContext.jsx';
import { BOUTIQUE } from '../config.js';
import logo from '../assets/logo.jpg';

const liens = [
  { to: '/', label: 'Accueil', fin: true },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { nombreArticles } = usePanier();
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center">
          <img src={logo} alt={BOUTIQUE.nom} className="h-12 w-auto object-contain sm:h-14" />
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {liens.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              end={lien.fin}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 font-display font-medium tracking-wide transition ${
                  isActive
                    ? 'bg-rose text-white shadow-sm shadow-rose/30'
                    : 'text-rose-dark hover:bg-rose-light hover:text-rose'
                }`
              }
            >
              {lien.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <IconePanier nombreArticles={nombreArticles} />

          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setMenuOuvert((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            <span className="h-0.5 w-6 bg-rose-dark" />
            <span className="h-0.5 w-6 bg-rose-dark" />
            <span className="h-0.5 w-6 bg-rose-dark" />
          </button>
        </div>
      </div>

      {menuOuvert && (
        <nav className="flex flex-col gap-1 border-t border-rose-light bg-white px-4 pb-4 md:hidden">
          {liens.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              end={lien.fin}
              onClick={() => setMenuOuvert(false)}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-display font-medium tracking-wide transition ${
                  isActive ? 'bg-rose text-white' : 'text-rose-dark hover:bg-rose-light'
                }`
              }
            >
              {lien.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

function IconePanier({ nombreArticles }) {
  return (
    <NavLink
      to="/panier"
      aria-label="Voir mon panier"
      className={({ isActive }) =>
        `group relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-rose-light ${
          isActive ? 'bg-rose-light' : ''
        }`
      }
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 text-gray-700 transition group-hover:text-rose group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.4a1 1 0 001 .8h9.2a1 1 0 001-.8L20 8H6" />
        <circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      {nombreArticles > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop-in items-center justify-center rounded-full bg-rose px-1 text-[11px] font-bold text-white">
          {nombreArticles}
        </span>
      )}
    </NavLink>
  );
}
