import React from "react";
import { Users, Phone, FileText, Truck, BadgePercent } from "lucide-react";

export default function InfoBar() {
  return (
    <div className="bg-gray-100 text-sm">
      <div className="container mx-auto px-4 py-2 flex flex-wrap items-center gap-x-8 gap-y-2">
        <span className="inline-flex items-center text-gray-700">
          <Users size={16} className="mr-2" />
          Exklusiv für Gewerbetreibende
        </span>
        <a
          href="tel:+435082420"
          className="inline-flex items-center text-gray-700 hover:underline"
        >
          <Phone size={16} className="mr-2" />
          Service-Hotline +43 50 8242 0
        </a>
        <span className="inline-flex items-center text-gray-700">
          <FileText size={16} className="mr-2" />
          Kauf auf Rechnung
        </span>
        <span className="inline-flex items-center text-gray-700">
          <Truck size={16} className="mr-2" />
          Schnelle Lieferung
        </span>
        <span className="inline-flex items-center text-gray-700">
          <BadgePercent size={16} className="mr-2" />
          Über 60.000 Produkte
        </span>
      </div>
    </div>
  );
}
