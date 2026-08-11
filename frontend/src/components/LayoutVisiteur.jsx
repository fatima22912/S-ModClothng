import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import BoutonWhatsApp from './BoutonWhatsApp.jsx';

export default function LayoutVisiteur() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BoutonWhatsApp />
    </div>
  );
}
