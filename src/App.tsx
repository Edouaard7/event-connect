import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Spinner from "./components/Spinner";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EventsPage from "./pages/EventsPage";
import EquipmentPage from "./pages/EquipmentPage";
import UsersPage from "./pages/UsersPage";
import ReservationsPage from "./pages/ReservationsPage";
import ReportsPage from "./pages/ReportsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/registro" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/equipos" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/reservas" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
