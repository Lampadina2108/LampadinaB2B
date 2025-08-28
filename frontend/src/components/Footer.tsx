import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Lampadina</h3>
            <p className="text-gray-300 mb-4">
              Ihr zuverlässiger Partner für professionelle Beleuchtungslösungen in Österreich.
            </p>
            <p className="text-gray-400 text-sm">
              UID: ATU78681179<br />
              Firmenbuchnummer: FN 123456a
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Produktkategorien</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-amber-400">LED Band</a></li>
              <li><a href="#" className="hover:text-amber-400">Alu Profile</a></li>
              <li><a href="#" className="hover:text-amber-400">Einbaustrahler</a></li>
              <li><a href="#" className="hover:text-amber-400">Schienensystem</a></li>
              <li><a href="#" className="hover:text-amber-400">Trafo Dimmer</a></li>
              <li><a href="#" className="hover:text-amber-400">Leuchtmittel</a></li>
              <li><a href="#" className="hover:text-amber-400">Leuchten</a></li>
              <li><a href="#" className="hover:text-amber-400">Weihnachtsbeleuchtung</a></li>
              <li><a href="#" className="hover:text-amber-400">Aufbaustrahler</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Kundenservice</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-amber-400">Kontakt</a></li>
              <li><a href="#" className="hover:text-amber-400">Zugang anfordern</a></li>
              <li><a href="#" className="hover:text-amber-400">Hilfe & FAQ</a></li>
              <li><a href="#" className="hover:text-amber-400">Versand & Lieferung</a></li>
              <li><a href="#" className="hover:text-amber-400">Retouren</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Rechtliches</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-amber-400">AGB</a></li>
              <li><a href="#" className="hover:text-amber-400">Datenschutz</a></li>
              <li><a href="#" className="hover:text-amber-400">Impressum</a></li>
              <li><a href="#" className="hover:text-amber-400">Widerrufsrecht</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Lampadina. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Folgen Sie uns:</span>
            <div className="flex space-x-2">
              <a href="#" className="text-gray-400 hover:text-amber-400">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-amber-400">YouTube</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}