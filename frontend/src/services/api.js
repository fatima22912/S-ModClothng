import { API_URL } from '../config.js';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function requete(chemin, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let reponse;
  try {
    reponse = await fetch(`${API_URL}${chemin}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError('Impossible de contacter le serveur. Vérifiez votre connexion.', 0);
  }

  let donnees = null;
  const texte = await reponse.text();
  if (texte) {
    try {
      donnees = JSON.parse(texte);
    } catch {
      donnees = null;
    }
  }

  if (!reponse.ok) {
    const message = donnees?.erreur || "Une erreur est survenue, veuillez réessayer.";
    throw new ApiError(message, reponse.status);
  }

  return donnees;
}

export const api = {
  // Public
  listerProduits: (filtres = {}) => {
    const params = new URLSearchParams();
    if (filtres.categorie) params.set('categorie', filtres.categorie);
    if (filtres.taille) params.set('taille', filtres.taille);
    const suffixe = params.toString() ? `?${params.toString()}` : '';
    return requete(`/produits${suffixe}`);
  },
  obtenirProduit: (id) => requete(`/produits/${id}`),
  listerCategories: () => requete('/categories'),
  creerCommande: (donnees) => requete('/commandes', { method: 'POST', body: donnees }),
  infosPaiementWave: (idCommande) =>
    requete('/paiement/wave/initier', { method: 'POST', body: { id_commande: idCommande } }),
  infosPaiementOrangeMoney: (idCommande) =>
    requete('/paiement/orange-money/initier', { method: 'POST', body: { id_commande: idCommande } }),

  // Authentification
  login: (email, mot_de_passe) => requete('/auth/login', { method: 'POST', body: { email, mot_de_passe } }),

  // Propriétaire
  proprietaireCommandes: (token) => requete('/proprietaire/commandes', { token }),
  proprietaireChangerStatut: (token, idCommande, donnees) =>
    requete(`/proprietaire/commandes/${idCommande}/statut`, { method: 'PATCH', body: donnees, token }),
  proprietaireStatistiques: (token) => requete('/proprietaire/statistiques', { token }),
  proprietaireListerProduits: (token) => requete('/proprietaire/produits', { token }),
  proprietaireCreerProduit: (token, donnees) => requete('/proprietaire/produits', { method: 'POST', body: donnees, token }),
  proprietaireModifierProduit: (token, id, donnees) =>
    requete(`/proprietaire/produits/${id}`, { method: 'PUT', body: donnees, token }),
  proprietaireSupprimerProduit: (token, id) => requete(`/proprietaire/produits/${id}`, { method: 'DELETE', token }),
  proprietaireUploaderImage: (token, id, formData) =>
    requete(`/proprietaire/produits/${id}/image`, { method: 'POST', body: formData, token, isFormData: true }),

  // Administrateur
  adminListerProduits: (token) => requete('/admin/produits', { token }),
  adminCreerProduit: (token, donnees) => requete('/admin/produits', { method: 'POST', body: donnees, token }),
  adminModifierProduit: (token, id, donnees) => requete(`/admin/produits/${id}`, { method: 'PUT', body: donnees, token }),
  adminSupprimerProduit: (token, id) => requete(`/admin/produits/${id}`, { method: 'DELETE', token }),
  adminUploaderImage: (token, id, formData) =>
    requete(`/admin/produits/${id}/image`, { method: 'POST', body: formData, token, isFormData: true }),
  adminListerProprietaires: (token) => requete('/admin/proprietaires', { token }),
  adminCreerProprietaire: (token, donnees) => requete('/admin/proprietaires', { method: 'POST', body: donnees, token }),
  adminSupprimerProprietaire: (token, id) => requete(`/admin/proprietaires/${id}`, { method: 'DELETE', token }),
};

export { ApiError };
