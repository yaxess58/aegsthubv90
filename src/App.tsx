import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/authContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SecurityLogs from "./pages/SecurityLogs";
import Disputes from "./pages/Disputes";
import VendorDashboard from "./pages/VendorDashboard";
import VendorWalletPage from "./pages/VendorWallet";
import VendorBond from "./pages/VendorBond";
import Market from "./pages/Market";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import SecuritySettings from "./pages/SecuritySettings";
import Forum from "./pages/Forum";
import VendorProfile from "./pages/VendorProfile";
import { ReactNode } from "react";
import BackgroundMusic from "./components/BackgroundMusic";
import { BackgroundProvider } from "./lib/backgroundContext";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary font-mono animate-pulse">Yükleniyor...</div></div>;
  if (!user) return <Navigate to="/" replace />;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, role, loading, logout } = useAuth();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary font-mono animate-pulse">Yükleniyor...</div></div>;

  if (user && !role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card neon-border rounded-lg p-6 w-full max-w-md text-center space-y-4">
          <div>
            <h1 className="text-2xl font-mono font-bold text-primary neon-text">aeigsthub</h1>
            <p className="text-xs font-mono text-muted-foreground mt-2">Hesap yetkisi yüklenemedi.</p>
          </div>
          <button onClick={() => void logout()} className="w-full bg-primary text-primary-foreground py-3 rounded font-mono text-sm font-bold hover:opacity-90 transition-all">Çıkış yap</button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user && role ? <Navigate to={role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : "/market"} replace /> : <Login />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/security-logs" element={<ProtectedRoute allowedRoles={["admin"]}><SecurityLogs /></ProtectedRoute>} />
      <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={["admin"]}><Disputes /></ProtectedRoute>} />
      <Route path="/vendor" element={<ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>} />
      <Route path="/vendor/wallet" element={<ProtectedRoute allowedRoles={["vendor"]}><VendorWalletPage /></ProtectedRoute>} />
      <Route path="/vendor/bond" element={<ProtectedRoute allowedRoles={["vendor"]}><VendorBond /></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute allowedRoles={["buyer"]}><Market /></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProtectedRoute allowedRoles={["buyer"]}><ProductDetail /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute allowedRoles={["buyer", "vendor", "admin"]}><Transactions /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["buyer", "vendor"]}><Profile /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute allowedRoles={["buyer", "admin"]}><Orders /></ProtectedRoute>} />
      <Route path="/security" element={<ProtectedRoute allowedRoles={["buyer", "vendor", "admin"]}><SecuritySettings /></ProtectedRoute>} />
      <Route path="/forum" element={<ProtectedRoute allowedRoles={["buyer", "vendor", "admin"]}><Forum /></ProtectedRoute>} />
      <Route path="/vendor/:vendorId" element={<ProtectedRoute allowedRoles={["buyer", "vendor", "admin"]}><VendorProfile /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BackgroundProvider>
            <AppRoutes />
            <BackgroundMusic />
          </BackgroundProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
