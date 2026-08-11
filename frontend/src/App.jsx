import { Route, Routes } from 'react-router-dom';

import LayoutVisiteur from './components/LayoutVisiteur.jsx';
import RouteProtegee from './components/RouteProtegee.jsx';

import Accueil from './pages/visiteur/Accueil.jsx';
import Catalogue from './pages/visiteur/Catalogue.jsx';
import FicheProduit from './pages/visiteur/FicheProduit.jsx';
import Panier from './pages/visiteur/Panier.jsx';
import Commande from './pages/visiteur/Commande.jsx';
import Confirmation from './pages/visiteur/Confirmation.jsx';
import Contact from './pages/visiteur/Contact.jsx';

import ConnexionProprietaire from './pages/proprietaire/Connexion.jsx';
import DashboardProprietaire from './pages/proprietaire/Dashboard.jsx';
import ProduitsProprietaire from './pages/proprietaire/Produits.jsx';
import StatistiquesProprietaire from './pages/proprietaire/Statistiques.jsx';

import ConnexionAdmin from './pages/admin/Connexion.jsx';
import AdminProduits from './pages/admin/Produits.jsx';
import AdminProprietaires from './pages/admin/Proprietaires.jsx';

export default function App() {
  return (
    <Routes>
      {/* Visiteur */}
      <Route element={<LayoutVisiteur />}>
        <Route path="/" element={<Accueil />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/produits/:id" element={<FicheProduit />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="/commande" element={<Commande />} />
        <Route path="/commande/confirmation" element={<Confirmation />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Propriétaire */}
      <Route path="/proprietaire/connexion" element={<ConnexionProprietaire />} />
      <Route
        path="/proprietaire/dashboard"
        element={
          <RouteProtegee role="proprietaire">
            <DashboardProprietaire />
          </RouteProtegee>
        }
      />
      <Route
        path="/proprietaire/produits"
        element={
          <RouteProtegee role="proprietaire">
            <ProduitsProprietaire />
          </RouteProtegee>
        }
      />
      <Route
        path="/proprietaire/statistiques"
        element={
          <RouteProtegee role="proprietaire">
            <StatistiquesProprietaire />
          </RouteProtegee>
        }
      />

      {/* Administrateur */}
      <Route path="/admin/connexion" element={<ConnexionAdmin />} />
      <Route
        path="/admin/produits"
        element={
          <RouteProtegee role="administrateur">
            <AdminProduits />
          </RouteProtegee>
        }
      />
      <Route
        path="/admin/proprietaires"
        element={
          <RouteProtegee role="administrateur">
            <AdminProprietaires />
          </RouteProtegee>
        }
      />

      <Route path="*" element={<PageIntrouvable />} />
    </Routes>
  );
}

function PageIntrouvable() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-3xl font-bold text-rose-dark">Page introuvable</h1>
      <a href="/" className="btn-rose">
        Retour à l'accueil
      </a>
    </div>
  );
}
