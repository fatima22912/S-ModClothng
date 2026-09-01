export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Base de l'API sans le préfixe /api, pour construire les URL des images uploadées
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');

export const BOUTIQUE = {
  nom: "S'Mod Clothing",
  proprietaire: 'Ngoné Seck',
  telephones: ['787346777', '786525821'],
  whatsapp: '221787346777',
  wavePaymentLink: 'https://pay.wave.com/m/M_sn_nSnCGLfVeL3K/c/sn/',
};

export const DEVELOPPEUR = {
  nom: 'Fatou Mbaye',
  telephone: '768328120',
  email: 'fatoumbaye1@esp.sn',
};

export const COULEURS_SUGGEREES = [
  { nom: 'Blanc', hex: '#FFFFFF' },
  { nom: 'Noir', hex: '#111111' },
  { nom: 'Gris', hex: '#9CA3AF' },
  { nom: 'Beige', hex: '#D9C7A7' },
  { nom: 'Marron', hex: '#7C4A2D' },
  { nom: 'Rouge', hex: '#DC2626' },
  { nom: 'Rose', hex: '#EC4899' },
  { nom: 'Orange', hex: '#EA580C' },
  { nom: 'Jaune', hex: '#EAB308' },
  { nom: 'Vert', hex: '#16A34A' },
  { nom: 'Bleu', hex: '#2563EB' },
  { nom: 'Violet', hex: '#7C3AED' },
];

export function buildImageUrl(cheminImage) {
  if (!cheminImage) return null;
  if (cheminImage.startsWith('http')) return cheminImage;
  return `${API_BASE_URL}/uploads/${cheminImage}`;
}

export function formaterPrix(prix) {
  return `${Number(prix).toLocaleString('fr-FR')} FCFA`;
}
