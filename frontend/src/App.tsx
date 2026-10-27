import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BaggageManagement from './pages/BaggageManagement';
import FlightBoard from './pages/FlightBoard';
import ConveyorMap from './pages/ConveyorMap';
import RoutingCalculator from './pages/RoutingCalculator';
import DatabaseStatus from './pages/DatabaseStatus';
import PassengerTracker from './pages/PassengerTracker';
import StaffLogin from './pages/StaffLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const location = useLocation();

  // Public standalone pages without staff sidebar
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <StaffLogin />;
  }

  if (location.pathname === '/track') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '16px 12px' }}>
        <PassengerTracker />
      </div>
    );
  }

  // Restricted airport staff portal with sidebar
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/baggage"
            element={
              <ProtectedRoute>
                <BaggageManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flights"
            element={
              <ProtectedRoute>
                <FlightBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conveyor"
            element={
              <ProtectedRoute>
                <ConveyorMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routing"
            element={
              <ProtectedRoute>
                <RoutingCalculator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/database"
            element={
              <ProtectedRoute>
                <DatabaseStatus />
              </ProtectedRoute>
            }
          />
          {/* Passenger tracker is accessible both embedded and standalone */}
          <Route path="/track" element={<PassengerTracker />} />
          <Route path="/login" element={<StaffLogin />} />
          <Route path="/register" element={<StaffLogin />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
