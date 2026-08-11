import { BOUTIQUE } from '../../config.js';

export default function Contact() {
  const message = encodeURIComponent(`Bonjour ${BOUTIQUE.proprietaire}, j'ai une question concernant ${BOUTIQUE.nom}.`);

  return (
    <div className="container-page flex flex-col items-center gap-6 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">Contactez-nous</h1>
      <p className="max-w-md text-gray-600">
        Pour toute question sur un article, une commande ou une livraison, contactez-nous directement via WhatsApp.
      </p>

      <a
        href={`https://wa.me/${BOUTIQUE.whatsapp}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-rose"
      >
        Discuter sur WhatsApp
      </a>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-rose-dark">Téléphone</h2>
          {BOUTIQUE.telephones.map((tel) => (
            <p key={tel}>
              <a href={`tel:+221${tel}`} className="text-gray-700 hover:text-rose">
                +221 {tel}
              </a>
            </p>
          ))}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-rose-dark">Retrait de commande</h2>
          <p className="text-gray-700">{BOUTIQUE.adresseRetrait}</p>
        </div>
      </div>
    </div>
  );
}
