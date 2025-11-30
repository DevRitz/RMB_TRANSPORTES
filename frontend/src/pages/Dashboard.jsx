import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, DollarSign, Receipt, TrendingUp, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { truckService, reportService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrucks: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Timeout de segurança - se demorar mais de 10 segundos, para de carregar
      const timeoutId = setTimeout(() => {
        console.warn('Dashboard: timeout ao carregar estatísticas');
        setLoading(false);
      }, 10000);

      try {
        // Buscar total de caminhões
        const trucksResponse = await truckService.getAll();
        const totalTrucks = trucksResponse.data.length;

        // Para simplificar, vamos calcular estatísticas básicas
        // Em uma implementação real, você criaria endpoints específicos para isso
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const summaryResponse = await reportService.getGeneralMonthlySummary(currentYear, currentMonth);
        const summary = summaryResponse.data;

        const totalRevenue = summary.reduce((sum, truck) => sum + parseFloat(truck.monthly_revenue || 0), 0);
        const totalExpenses = summary.reduce((sum, truck) => 
          sum + parseFloat(truck.monthly_fuel_expenses || 0) + 
          parseFloat(truck.monthly_driver_expenses || 0) + 
          parseFloat(truck.monthly_maintenance_expenses || 0), 0
        );

        setStats({
          totalTrucks,
          totalRevenue,
          totalExpenses,
          balance: totalRevenue - totalExpenses,
        });
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        clearTimeout(timeoutId);
        // Mesmo com erro, setar loading como false para mostrar a interface
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const quickActions = [
    {
      title: 'Caminhões',
      description: 'Ver veiculos da sua frota',
      href: '/trucks',
      icon: Truck,
      color: 'bg-blue-500',
    },
    {
      title: 'Registrar Receita',
      description: 'Lançar receita de viagem',
      href: '/revenues/new',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Registrar Despesa',
      description: 'Lançar gastos do caminhão',
      href: '/expenses/fuel/new',
      icon: Receipt,
      color: 'bg-red-500',
    },
    {
      title: 'Ver Relatórios',
      description: 'Análises e balanços',
      href: '/reports',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral da sua frota de caminhões
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Caminhões</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrucks}</div>
            <p className="text-xs text-muted-foreground">
              Veículos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balanço do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lucro/Prejuízo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link to={action.href}>
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

