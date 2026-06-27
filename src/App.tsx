import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";

import { AuthProvider } from "./contexts/AuthContext";
import { useToast } from "./hooks/useToast";
import { ToastContainer } from "./components/ui/ToastContainer";

import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

import { Dashboard } from "./pages/Dashboard";
import { DeviceValuation } from "./pages/DeviceValuation";
import { PickupRequests } from "./pages/PickupRequests";
import { SupplyChain } from "./pages/SupplyChain";
import { ImpactAnalytics } from "./pages/ImpactAnalytics";

import ScraperDashboard from "./pages/ScraperDashboard";
import DealerDashboard from "./pages/DealerDashboard";
import RecyclerDashboard from "./pages/RecyclerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

import { SettingsPage } from "./pages/Settings";
import { ScraperRegistration } from "./pages/ScraperRegistration";
import { RecyclerRegistration } from "./pages/RecyclerRegistration";
import { PickupDetails } from "./pages/PickupDetails";

import { ScraperRequestView } from "./pages/ScraperRequestView";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LiveAuctionRoom } from "./components/ui/LiveAuctionRoom";

function AppWithToast() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/valuation" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><DeviceValuation /></ProtectedRoute>} />
        <Route path="/pickups" element={<ProtectedRoute allowedRoles={['customer', 'scraper', 'admin']}><PickupRequests /></ProtectedRoute>} />
        <Route path="/supply-chain" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><SupplyChain /></ProtectedRoute>} />
        <Route path="/impact" element={<ProtectedRoute allowedRoles={['customer', 'recycler', 'admin']}><ImpactAnalytics /></ProtectedRoute>} />

        {/* Scraper / Dealer */}
        <Route path="/scraper-dashboard" element={<ProtectedRoute allowedRoles={['scraper', 'admin']}><ScraperDashboard /></ProtectedRoute>} />
        <Route path="/pickup/:id" element={<ProtectedRoute><PickupDetails /></ProtectedRoute>} />
        <Route path="/dealer-dashboard" element={<ProtectedRoute allowedRoles={['scraper', 'admin']}><DealerDashboard /></ProtectedRoute>} />
        
        {/* Scraper Request View (Added) */}
        <Route path="/scraper-request/:id" element={<ProtectedRoute allowedRoles={['scraper', 'admin']}><ScraperRequestView /></ProtectedRoute>} />

        {/* Recycler / Admin */}
        <Route path="/recycler-dashboard" element={<ProtectedRoute allowedRoles={['recycler', 'admin']}><RecyclerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        
        {/* Live Auction Room (Scraper & Recycler) */}
        <Route path="/auction/:id" element={<ProtectedRoute allowedRoles={['scraper', 'recycler', 'admin']}><LiveAuctionRoom /></ProtectedRoute>} />

        {/* Extra */}
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/scraper-registration" element={<ProtectedRoute><ScraperRegistration /></ProtectedRoute>} />
        <Route path="/recycler-registration" element={<ProtectedRoute><RecyclerRegistration /></ProtectedRoute>} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppWithToast />
      </AuthProvider>
    </BrowserRouter>
  );
}