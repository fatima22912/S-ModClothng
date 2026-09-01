import { Link, Navigate, useLocation } from 'react-router-dom';
import { BOUTIQUE, formaterPrix } from '../../config.js';
import logoOrangeMoney from '../../assets/orange-money-logo.jpg';
import logoWave from '../../assets/wave-logo.jpg';

export default function Confirmation() {
  const { state } = useLocation();

  if (!state?.commande) {
    return <Navigate to="/" replace />;
  }

  const { commande, infosPaiement } = state;
  const estWave = commande.mode_paiement === 'wave';

  const messageWhatsapp = encodeURIComponent(
    `Bonjour, je viens de passer une commande sur ${BOUTIQUE.nom} (${formaterPrix(
      commande.montant_total
    )}) et je vous transmets la capture d'écran de mon paiement ${estWave ? 'Wave' : 'Orange Money'}.`
  );

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-light text-2xl text-rose">
            ✓
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Commande enregistrée !</h1>
          <p className="mt-1 text-gray-600">Total : {formaterPrix(commande.montant_total)}</p>
        </div>

        <div className="rounded-xl bg-rose-light p-5">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-semibold text-rose-dark">
              {estWave ? 'Paiement Wave' : 'Dernière étape : réglez votre commande par'}
            </h2>
            {estWave ? (
              <img src={logoWave} alt="Wave" className="h-6 w-6 rounded object-contain" />
            ) : (
              <img src={logoOrangeMoney} alt="Orange Money" className="h-6 w-auto object-contain" />
            )}
          </div>
          <p className="mb-4 text-sm text-gray-700">{infosPaiement.instructions}</p>

          {!estWave && (
            <div className="flex flex-col items-center gap-3">
              <img
                src={infosPaiement.qr_code_image}
                alt="QR code de paiement Orange Money"
                className="h-56 w-56 rounded-xl border border-white bg-white object-contain p-2"
              />
              <p className="text-center text-sm text-gray-600">
                Scannez ce code avec l'application Orange Money pour payer {formaterPrix(commande.montant_total)}.
              </p>
            </div>
          )}
        </div>

        <p className="mt-5 text-sm text-gray-600">
          Une fois le paiement effectué, envoyez-nous une <strong>capture d'écran</strong> de la confirmation sur
          WhatsApp pour une validation rapide de votre commande. Sinon, {BOUTIQUE.proprietaire} vérifie et confirme
          les paiements manuellement dans les meilleurs délais.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${BOUTIQUE.whatsapp}?text=${messageWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rose flex-1"
          >
            Envoyer ma capture d'écran sur WhatsApp
          </a>
          <Link to="/catalogue" className="btn-rose-outline flex-1 text-center">
            Continuer mes achats
          </Link>
        </div>

        <div className="mt-8 border-t pt-5 text-sm text-gray-600">
          <p className="font-medium text-gray-800">Récapitulatif</p>
          <ul className="mt-2 space-y-1">
            {commande.lignes.map((ligne) => (
              <li key={ligne.id} className="flex justify-between">
                <span>
                  {ligne.nom_produit} {ligne.taille && `(${ligne.taille})`} × {ligne.quantite}
                </span>
                <span>{formaterPrix(ligne.prix_unitaire * ligne.quantite)}</span>
              </li>
            ))}
          </ul>
          {commande.mode_livraison === 'retrait_boutique' ? (
            <p className="mt-3">Retrait : {BOUTIQUE.adresseRetrait}</p>
          ) : (
            <p className="mt-3">
              Livraison : {commande.adresse_livraison}, {commande.ville}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
