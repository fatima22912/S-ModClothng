import { BOUTIQUE, DEVELOPPEUR } from '../config.js';

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-gradient-to-b from-rose-dark to-[#7d0c47] text-white">
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute -top-[38px] left-0 h-10 w-full text-rose-dark sm:-top-[58px] sm:h-14"
      >
        <path
          fill="currentColor"
          d="M0,32 C240,64 480,0 720,16 C960,32 1200,64 1440,32 L1440,60 L0,60 Z"
        />
      </svg>

      <div className="container-page relative grid gap-10 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-bold">{BOUTIQUE.nom}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
            Boutique en ligne de vêtements pour femmes
            <span className="text-rose-light">♥</span>
          </p>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <IconeTelephone />
            Contact
          </h4>
          <ul className="space-y-1.5 text-sm text-white/80">
            {BOUTIQUE.telephones.map((tel) => (
              <li key={tel}>
                <a href={`tel:+221${tel}`} className="transition hover:pl-1 hover:text-white">
                  +221 {tel}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 font-semibold">
            <IconeLieu />
            Livraison
          </h4>
          <p className="text-sm text-white/80">Livraison partout dans le monde</p>
        </div>
      </div>

      <div className="relative border-t border-white/15 py-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} {BOUTIQUE.nom}. Tous droits réservés.
        <p className="mt-1.5">
          Site conçu par {DEVELOPPEUR.nom} — besoin d'un site ou d'une application&nbsp;?{' '}
          <a href={`tel:+221${DEVELOPPEUR.telephone}`} className="underline hover:text-white">
            +221 {DEVELOPPEUR.telephone}
          </a>{' '}
          ·{' '}
          <a href={`mailto:${DEVELOPPEUR.email}`} className="underline hover:text-white">
            {DEVELOPPEUR.email}
          </a>
        </p>
      </div>
    </footer>
  );
}

function IconeTelephone() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-light" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.76l1 4a1 1 0 01-.5 1.11L7 10c1 2.5 3.5 5 6 6l1.13-1.75a1 1 0 011.11-.5l4 1a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C10.5 21 3 13.5 3 6V5z"
      />
    </svg>
  );
}

function IconeLieu() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-light" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.1-7-11a7 7 0 1114 0c0 4.9-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
