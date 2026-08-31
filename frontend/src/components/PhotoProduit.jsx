import ImageAvecSecours from './ImageAvecSecours.jsx';
import logo from '../assets/logo.jpg';

export default function PhotoProduit({ src, alt, className, enStock = true, afficherBadge = true }) {
  return (
    <div className="relative h-full w-full">
      <ImageAvecSecours src={src} alt={alt} className={className} />

      {afficherBadge && enStock && (
        <span className="absolute left-3 top-3 rounded-full bg-rose px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          En stock
        </span>
      )}
      {afficherBadge && !enStock && (
        <span className="absolute left-3 top-3 rounded-full bg-gray-700/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          Rupture de stock
        </span>
      )}

      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 right-2 w-[34%] max-w-[130px] opacity-95 mix-blend-multiply"
      />
    </div>
  );
}
