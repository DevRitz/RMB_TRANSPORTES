import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TruckList from './pages/trucks/TruckList';
import TruckForm from './pages/trucks/TruckForm';
import TruckDetails from './pages/trucks/TruckDetails';
import RevenueForm from './pages/revenues/RevenueForm';
import RevenueList from './pages/revenues/RevenueList';
import FuelExpenseForm from './pages/expenses/FuelExpenseForm';
import DriverExpenseForm from './pages/expenses/DriverExpenseForm';
import MaintenanceExpenseForm from './pages/expenses/MaintenanceExpenseForm';
import OtherExpenses from './pages/expenses/OtherExpenses';
import ExpensesCrud from './pages/expenses/ExpensesCrud';
import OtherExpenseForm from './pages/expenses/OtherExpenseForm';
import Reports from './pages/reports/Reports';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Rota de login (pública) */}
            <Route path="/login" element={<Login />} />
            
            {/* Redirect da raiz para dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rotas protegidas */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />

            {/* Caminhões */}
            <Route path="/trucks" element={
              <PrivateRoute>
                <Layout>
                  <TruckList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/trucks/new" element={
              <PrivateRoute>
                <Layout>
                  <TruckForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/trucks/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <TruckForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/trucks/:id" element={
              <PrivateRoute>
                <Layout>
                  <TruckDetails />
                </Layout>
              </PrivateRoute>
            } />

            {/* Receitas */}
            <Route path="/revenues/list" element={
              <PrivateRoute>
                <Layout>
                  <RevenueList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/revenues/new" element={
              <PrivateRoute>
                <Layout>
                  <RevenueForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/revenues/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <RevenueForm />
                </Layout>
              </PrivateRoute>
            } />

            {/* Despesas */}
            <Route path="/expenses/manage" element={
              <PrivateRoute>
                <Layout>
                  <ExpensesCrud />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/expenses/fuel/new" element={
              <PrivateRoute>
                <Layout>
                  <FuelExpenseForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/expenses/driver/new" element={
              <PrivateRoute>
                <Layout>
                  <DriverExpenseForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/expenses/maintenance/new" element={
              <PrivateRoute>
                <Layout>
                  <MaintenanceExpenseForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/expenses/other/new" element={
              <PrivateRoute>
                <Layout>
                  <OtherExpenses />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/expenses/other/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <OtherExpenseForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/expenses/fuel/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <FuelExpenseForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/expenses/driver/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <DriverExpenseForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/expenses/maintenance/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <MaintenanceExpenseForm />
                </Layout>
              </PrivateRoute>
            } />

            {/* Relatórios */}
            <Route path="/reports" element={
              <PrivateRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
