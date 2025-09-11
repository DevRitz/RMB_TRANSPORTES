import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, DollarSign, Receipt, Fuel, User, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  truckService, 
  revenueService, 
  fuelExpenseService, 
  driverExpenseService, 
  maintenanceExpenseService,
  reportService 
} from '../../services/api';

const TruckDetails = () => {
  const [truck, setTruck] = useState(null);
  const [revenues, setRevenues] = useState([]);
  const [fuelExpenses, setFuelExpenses] = useState([]);
  const [driverExpenses, setDriverExpenses] = useState([]);
  const [maintenanceExpenses, setMaintenanceExpenses] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTruckData();
  }, [id]);

  const fetchTruckData = async () => {
    try {
      const [
        truckResponse,
        revenuesResponse,
        fuelResponse,
        driverResponse,
        maintenanceResponse,
        balanceResponse
      ] = await Promise.all([
        truckService.getById(id),
        revenueService.getByTruck(id),
        fuelExpenseService.getByTruck(id),
        driverExpenseService.getByTruck(id),
        maintenanceExpenseService.getByTruck(id),
        reportService.getTruckBalance(id)
      ]);

      setTruck(truckResponse.data);
      setRevenues(revenuesResponse.data);
      setFuelExpenses(fuelResponse.data);
      setDriverExpenses(driverResponse.data);
      setMaintenanceExpenses(maintenanceResponse.data);
      setBalance(balanceResponse.data);
    } catch (error) {
      console.error('Erro ao buscar dados do caminhão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do caminhão.',
        variant: 'destructive',
      });
      navigate('/trucks');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Caminhão não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/trucks')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Caminhão {truck.plate}</h2>
            <p className="text-muted-foreground">
              Detalhes e histórico do veículo
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to={`/trucks/edit/${truck.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Cards de Resumo */}
      {balance && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(balance.total_revenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  parseFloat(balance.total_fuel_expenses) + 
                  parseFloat(balance.total_driver_expenses) + 
                  parseFloat(balance.total_maintenance_expenses)
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balanço</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance.balance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Combustível</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(balance.total_fuel_expenses)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs com Histórico */}
      <Tabs defaultValue="revenues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenues">Receitas</TabsTrigger>
          <TabsTrigger value="fuel">Combustível</TabsTrigger>
          <TabsTrigger value="driver">Motorista</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="revenues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Receitas</CardTitle>
              <CardDescription>
                {revenues.length} receita(s) registrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenues.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma receita registrada ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenues.map((revenue) => (
                      <TableRow key={revenue.id}>
                        <TableCell>{formatDate(revenue.revenue_date)}</TableCell>
                        <TableCell>{revenue.description || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(revenue.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Combustível</CardTitle>
              <CardDescription>
                {fuelExpenses.length} abastecimento(s) registrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fuelExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum abastecimento registrado ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Litros</TableHead>
                      <TableHead>Preço/L</TableHead>
                      <TableHead>Quilometragem</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fuelExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.expense_date)}</TableCell>
                        <TableCell>{expense.liters}L</TableCell>
                        <TableCell>{formatCurrency(expense.price_per_liter)}</TableCell>
                        <TableCell>{expense.mileage.toLocaleString('pt-BR')} km</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(expense.liters * expense.price_per_liter)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="driver" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Despesas com Motorista</CardTitle>
              <CardDescription>
                {driverExpenses.length} despesa(s) registrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {driverExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma despesa com motorista registrada ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.expense_date)}</TableCell>
                        <TableCell>{expense.description || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Manutenção</CardTitle>
              <CardDescription>
                {maintenanceExpenses.length} despesa(s) registrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma despesa de manutenção registrada ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.expense_date)}</TableCell>
                        <TableCell>{expense.description || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TruckDetails;

