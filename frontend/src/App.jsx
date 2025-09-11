import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TruckList from './pages/trucks/TruckList';
import TruckForm from './pages/trucks/TruckForm';
import TruckDetails from './pages/trucks/TruckDetails';
import RevenueForm from './pages/revenues/RevenueForm';
import RevenueList from './pages/revenues/RevenueList';
import FuelExpenseForm from './pages/expenses/FuelExpenseForm';
import DriverExpenseForm from './pages/expenses/DriverExpenseForm';
import MaintenanceExpenseForm from './pages/expenses/MaintenanceExpenseForm';
import ExpensesCrud from './pages/expenses/ExpensesCrud'; // <<< NOVO
import Reports from './pages/reports/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Caminhões */}
            <Route path="/trucks" element={<TruckList />} />
            <Route path="/trucks/new" element={<TruckForm />} />
            <Route path="/trucks/edit/:id" element={<TruckForm />} />
            <Route path="/trucks/:id" element={<TruckDetails />} />

            {/* Receitas */}
            <Route path="/revenues/list" element={<RevenueList />} />
            <Route path="/revenues/new" element={<RevenueForm />} />
            <Route path="/revenues/edit/:id" element={<RevenueForm />} />

            {/* Despesas */}
            <Route path="/expenses/manage" element={<ExpensesCrud />} /> {/* <<< NOVO */}
            <Route path="/expenses/fuel/new" element={<FuelExpenseForm />} />
            <Route path="/expenses/driver/new" element={<DriverExpenseForm />} />
            <Route path="/expenses/maintenance/new" element={<MaintenanceExpenseForm />} />
            {/* Rotas de edição por tipo (usando os mesmos forms) */}
            <Route path="/expenses/fuel/edit/:id" element={<FuelExpenseForm />} /> {/* <<< NOVO */}
            <Route path="/expenses/driver/edit/:id" element={<DriverExpenseForm />} /> {/* <<< NOVO */}
            <Route path="/expenses/maintenance/edit/:id" element={<MaintenanceExpenseForm />} /> {/* <<< NOVO */}

            {/* Relatórios */}
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
