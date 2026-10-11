import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BaggageManagement from './pages/BaggageManagement';
import FlightBoard from './pages/FlightBoard';
import ConveyorMap from './pages/ConveyorMap';
import SimulationControls from './pages/SimulationControls';
import RoutingCalculator from './pages/RoutingCalculator';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/baggage" element={<BaggageManagement />} />
          <Route path="/flights" element={<FlightBoard />} />
          <Route path="/conveyor" element={<ConveyorMap />} />
          <Route path="/simulation" element={<SimulationControls />} />
          <Route path="/routing" element={<RoutingCalculator />} />
        </Routes>
      </main>
    </div>
  );
}
