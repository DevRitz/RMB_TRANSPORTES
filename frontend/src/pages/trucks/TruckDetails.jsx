import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, DollarSign, Receipt, Fuel } from 'lucide-react';
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
import { formatDate } from '@/lib/dateUtils';

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
      setRevenues(revenuesResponse.data || []);
      setFuelExpenses(fuelResponse.data || []);
      setDriverExpenses(driverResponse.data || []);
      setMaintenanceExpenses(maintenanceResponse.data || []);
      setBalance(balanceResponse.data || null);
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

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  const fmt = (v, d = 2) =>
    Number(v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const formatKm = (v) =>
    v != null && v !== '' ? `${Number(v).toLocaleString('pt-BR')} km` : '—';

  // --------- Cálculos de viagens/médias de combustível ----------
  const fuelTrips = useMemo(() => {
    if (!fuelExpenses?.length) return [];

    const sorted = [...fuelExpenses].sort((a, b) => {
      const da = new Date(a.expense_date).getTime();
      const db = new Date(b.expense_date).getTime();
      if (da !== db) return da - db;
      if ((a.mileage ?? 0) !== (b.mileage ?? 0)) return (a.mileage ?? 0) - (b.mileage ?? 0);
      return (a.id ?? 0) - (b.id ?? 0);
    });

    const rows = sorted.map((cur, i) => {
      if (i === 0) {
        return { ...cur, kmDriven: null, avgKmPerL: null };
      }
      const prev = sorted[i - 1];
      const kmDriven =
        cur?.mileage != null && prev?.mileage != null ? Number(cur.mileage) - Number(prev.mileage) : null;
      const liters = Number(cur.liters ?? 0);
      const avg = kmDriven != null && kmDriven > 0 && liters > 0 ? kmDriven / liters : null;
      return { ...cur, kmDriven, avgKmPerL: avg };
    });

    return rows;
  }, [fuelExpenses]);

  const fuelStats = useMemo(() => {
    const valid = fuelTrips.filter((t) => typeof t.avgKmPerL === 'number' && isFinite(t.avgKmPerL) && t.avgKmPerL > 0);
    if (valid.length === 0) {
      return { last: null, last3: null, overall: null, best: null, worst: null };
    }

    const last = valid[valid.length - 1].avgKmPerL;

    const last3Slice = valid.slice(-3);
    const last3 =
      last3Slice.reduce((acc, r) => acc + r.avgKmPerL, 0) / last3Slice.length;

    const sumKm = valid.reduce((acc, r) => acc + r.kmDriven, 0);
    const sumL = valid.reduce((acc, r) => acc + Number(r.liters ?? 0), 0);
    const overall = sumL > 0 ? sumKm / sumL : null;

    const best = Math.max(...valid.map((r) => r.avgKmPerL));
    const worst = Math.min(...valid.map((r) => r.avgKmPerL));

    return { last, last3, overall, best, worst };
  }, [fuelTrips]);

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
            <p className="text-muted-foreground">Detalhes e histórico do veículo</p>
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
                  Number(balance.total_fuel_expenses || 0) + 
                  Number(balance.total_driver_expenses || 0) + 
                  Number(balance.total_maintenance_expenses || 0)
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
              <div className={`text-2xl font-bold ${Number(balance.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

        {/* RECEITAS */}
        <TabsContent value="revenues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Receitas</CardTitle>
              <CardDescription>{revenues.length} receita(s) registrada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {revenues.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma receita registrada ainda.</p>
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

        {/* COMBUSTÍVEL */}
        <TabsContent value="fuel" className="space-y-4">
          {/* Cards de médias */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Última Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fuelStats.last ? `${fmt(fuelStats.last)} km/L` : '—'}
                </div>
                <p className="text-xs text-muted-foreground">Calculada entre os 2 últimos abastecimentos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Média (Últimos 3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fuelStats.last3 ? `${fmt(fuelStats.last3)} km/L` : '—'}
                </div>
                <p className="text-xs text-muted-foreground">Média das três viagens mais recentes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fuelStats.overall ? `${fmt(fuelStats.overall)} km/L` : '—'}
                </div>
                <p className="text-xs text-muted-foreground">Soma dos km ÷ soma dos litros</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Melhor / Pior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {fuelStats.best ? `${fmt(fuelStats.best)} km/L` : '—'} <span className="text-muted-foreground">/</span> {fuelStats.worst ? `${fmt(fuelStats.worst)} km/L` : '—'}
                </div>
                <p className="text-xs text-muted-foreground">Entre todas as viagens calculadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de abastecimentos + viagens */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Combustível</CardTitle>
              <CardDescription>{fuelExpenses.length} abastecimento(s) registrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {fuelExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum abastecimento registrado ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Litros</TableHead>
                      <TableHead className="text-right">Preço/L</TableHead>
                      <TableHead className="text-right">Quilometragem</TableHead>
                      <TableHead className="text-right">Km rodados</TableHead>
                      <TableHead className="text-right">Média (km/L)</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fuelTrips.map((exp) => {
                      const total = Number(exp.liters || 0) * Number(exp.price_per_liter || 0);
                      return (
                        <TableRow key={exp.id}>
                          <TableCell>{formatDate(exp.expense_date)}</TableCell>
                          <TableCell className="text-right">{fmt(exp.liters)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(exp.price_per_liter)}</TableCell>
                          <TableCell className="text-right">{formatKm(exp.mileage)}</TableCell>
                          <TableCell className="text-right">{exp.kmDriven != null ? formatKm(exp.kmDriven).replace(' km','') + ' km' : '—'}</TableCell>
                          <TableCell className="text-right">{exp.avgKmPerL ? `${fmt(exp.avgKmPerL)} km/L` : '—'}</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(total)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MOTORISTA */}
        <TabsContent value="driver" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Despesas com Motorista</CardTitle>
              <CardDescription>{driverExpenses.length} despesa(s) registrada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {driverExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma despesa com motorista registrada ainda.</p>
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

        {/* MANUTENÇÃO */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Manutenção</CardTitle>
              <CardDescription>{maintenanceExpenses.length} despesa(s) registrada(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma despesa de manutenção registrada ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Quilometragem</TableHead> {/* <<< NOVA COLUNA */}
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.expense_date)}</TableCell>
                        <TableCell>{expense.description || '-'}</TableCell>
                        <TableCell className="text-right">{formatKm(expense.mileage)}</TableCell> {/* <<< NOVO */}
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
