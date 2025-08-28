// src/App.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import HeroSlidesManager from "./components/HeroSlidesManager";
import CategoryPage from "./components/CategoryPage";
import ProductDetail from "./components/ProductDetail";
import ProfileOverview from "./components/ProfileOverview";
import SearchResults from "./components/SearchResults";
import SetPasswordPage from "./components/SetPasswordPage";
import AdminPanel from "./components/AdminPanel"; // Admin-Kundenverwaltung

import { useAuth } from "./contexts/AuthContext";

/** Gemeinsames Layout für alle Seiten */
const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <main className="container mx-auto px-4 py-6 flex-1">{children}</main>
    <Footer />
  </div>
);

/** Route-Guard: nur eingeloggte Benutzer */
const Protected: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state } = useAuth();
  const location = useLocation();

  if (!state.user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <>{children}</>;
};

/** Route-Guard: nur Admins */
const AdminOnly: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { state } = useAuth();
  const location = useLocation();

  if (!state.user) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  if (state.user.role !== "admin") {
    // Kein Admin → z.B. ins Konto
    return <Navigate to="/account" replace />;
  }
  return <>{children}</>;
};

/** Fallback-Seite */
const NotFound: React.FC = () => (
  <Layout>
    <div className="text-center text-gray-600 py-24">
      <h1 className="text-2xl font-semibold mb-2">Seite nicht gefunden</h1>
      <p className="mb-6">Die angeforderte Seite existiert nicht.</p>
      <a href="/" className="text-blue-600 hover:underline">
        Zur Startseite
      </a>
    </div>
  </Layout>
);

export default function App() {
  return (
    <Routes>
      {/* Startseite */}
      <Route
        path="/"
        element={
          <Layout>
            <HeroSlidesManager />
          </Layout>
        }
      />

      {/* Kategorien & Produkte */}
      <Route
        path="/category/:slug"
        element={
          <Layout>
            <CategoryPage />
          </Layout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <Layout>
            <ProductDetail />
          </Layout>
        }
      />

      {/* Suche */}
      <Route
        path="/search"
        element={
          <Layout>
            <SearchResults />
          </Layout>
        }
      />

      {/* Passwort setzen (Link aus E-Mail) */}
      <Route
        path="/set-password"
        element={
          <Layout>
            <SetPasswordPage />
          </Layout>
        }
      />

      {/* Kontoübersicht (nur eingeloggt) */}
      <Route
        path="/account"
        element={
          <Protected>
            <Layout>
              <ProfileOverview />
            </Layout>
          </Protected>
        }
      />

      {/* Admin-Kundenverwaltung (nur Admin) */}
      <Route
        path="/admin/customers"
        element={
          <AdminOnly>
            <Layout>
              <AdminPanel />
            </Layout>
          </AdminOnly>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
