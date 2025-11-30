import { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  truckService,
  reportService,
  driverExpenseService,
  fuelExpenseService,
  maintenanceExpenseService,
} from '../../services/api';

const months = [
  { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },   { value: '5', label: 'Maio' },      { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },   { value: '8', label: 'Agosto' },    { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },{ value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const years = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

// helper robusto p/ números em BR e EN
const num = (v) => {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = String(v).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s); // "1234.56"
  const normalized = s.replace(/\./g, '').replace(',', '.'); // "1.234,56" -> "1234.56"
  const x = Number.parseFloat(normalized);
  return Number.isFinite(x) ? x : 0;
};


const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num(v));
const formatLiters = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const formatKm = (v) =>
  (v || v === 0) ? `${Number(v).toLocaleString('pt-BR') } km` : '-';

export default function Reports() {
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));

  // aba atual
  const [tab, setTab] = useState('overview'); // 'overview' | 'individual' | 'expenses'

  // dados mensais (por caminhão) do período
  const [monthlyData, setMonthlyData] = useState([]);

  // Despesas (lista e total – o total agora também é calculado por filtro de caminhão)
  const [expenseType, setExpenseType] = useState('driver'); // 'driver' | 'fuel' | 'maintenance'
  const [expensesRows, setExpensesRows] = useState([]);
  const [expensesTotal, setExpensesTotal] = useState(null);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchTrucks(); }, []);
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      fetchMonthlyData();
      fetchExpensesTotal();
      fetchExpensesList();
    }
  }, [selectedYear, selectedMonth, expenseType]);

  // Troca automática entre overview/individual quando troca o caminhão (não muda se estiver em expenses)
  useEffect(() => {
    if (tab === 'expenses') return;
    setTab(selectedTruck !== 'ALL' ? 'individual' : 'overview');
  }, [selectedTruck, tab]);

  const fetchTrucks = async () => {
    try {
      const res = await truckService.getAll();
      setTrucks(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

const fetchMonthlyData = async () => {
  setLoading(true);
  const timeoutId = setTimeout(() => {
    console.warn('Reports: timeout ao carregar dados mensais');
    setLoading(false);
  }, 10000);

  try {
    const res = await reportService.getGeneralMonthlySummary(selectedYear, selectedMonth);
    const raw = res.data || [];

    // normaliza números
    const normalized = raw.map((t) => ({
      id: t.id ?? t.truck_id ?? null,
      plate: t.plate ?? t.truck ?? '',
      monthly_revenue: num(t.monthly_revenue),
      monthly_fuel_expenses: num(t.monthly_fuel_expenses),
      monthly_driver_expenses: num(t.monthly_driver_expenses),
      monthly_maintenance_expenses: num(t.monthly_maintenance_expenses),
    }));

    // >>> CONSOLIDAÇÃO POR CAMINHÃO (remove duplicações de JOIN)
    const byTruck = normalized.reduce((map, r) => {
      const key = r.id ?? r.plate; // usa id; se não vier, usa a placa
      if (!map.has(key)) {
        map.set(key, {
          id: r.id ?? null,
          plate: r.plate,
          monthly_revenue: 0,
          monthly_fuel_expenses: 0,
          monthly_driver_expenses: 0,
          monthly_maintenance_expenses: 0,
        });
      }
      const acc = map.get(key);
      acc.monthly_revenue += r.monthly_revenue;
      acc.monthly_fuel_expenses += r.monthly_fuel_expenses;
      acc.monthly_driver_expenses += r.monthly_driver_expenses;
      acc.monthly_maintenance_expenses += r.monthly_maintenance_expenses;
      return map;
    }, new Map());

    const consolidated = Array.from(byTruck.values()).map((t) => ({
      ...t,
      monthly_balance:
        t.monthly_revenue -
        t.monthly_fuel_expenses -
        t.monthly_driver_expenses -
        t.monthly_maintenance_expenses,
    }));

    setMonthlyData(consolidated);
    clearTimeout(timeoutId);
  } catch (e) {
    console.error('Erro ao buscar dados mensais:', e);
    clearTimeout(timeoutId);
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar os dados mensais.',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};


  const fetchExpensesTotal = async () => {
    try {
      if (expenseType === 'driver') {
        const res = await reportService.getDriverExpensesTotal(selectedYear, selectedMonth);
        const d = res.data || null;
        if (!d) return setExpensesTotal(null);
        setExpensesTotal({
          total_driver_expenses: num(d.total_driver_expenses ?? d.total ?? d.value),
          total_records: Number(d.total_records ?? d.count ?? 0),
        });
      } else {
        setExpensesTotal(null); // fuel/maintenance somamos localmente
      }
    } catch (e) {
      console.error('Erro ao buscar total de despesas:', e);
      setExpensesTotal(null);
    }
  };

  const fetchExpensesList = async () => {
    try {
      let res;
      if (expenseType === 'driver') {
        res = await driverExpenseService.getByPeriod(selectedYear, selectedMonth);
      } else if (expenseType === 'fuel') {
        res = await fuelExpenseService.getByPeriod(selectedYear, selectedMonth);
      } else {
        res = await maintenanceExpenseService.getByPeriod(selectedYear, selectedMonth);
      }

      const raw = res?.data ?? [];
      const rows = raw.map((r, i) => {
        const base = {
          id: r.id ?? i,
          truckId: r.truck_id ?? r.truckId ?? null,
          truck: r.truck ?? r.plate ?? r.truck_plate ?? '-',
          date: r.date ?? r.expense_date ?? r.created_at,
          description: r.description ?? r.note ?? r.obs ?? '',
          mileage: r.mileage ?? r.odometer ?? r.km ?? r.kilometers ?? null,
        };

        if (expenseType === 'fuel') {
          const liters = num(r.liters);
          const unit   = num(r.price_per_liter);
          const totalFromApi = num(r.total ?? r.total_price ?? r.amount ?? r.value ?? r.price ?? r.valor_total);
          const amount = totalFromApi || +(liters * unit).toFixed(2);

          const descFuel =
            base.description ||
            [
              r.gas_station ?? r.posto,
              liters ? `${formatLiters(liters)} L` : null,
              unit ? `@ ${formatCurrency(unit)}/L` : null,
            ].filter(Boolean).join(' • ');

          return { ...base, description: descFuel, amount };
        }

        if (expenseType === 'maintenance') {
          const amount = num(r.total ?? r.amount ?? r.value ?? r.price ?? r.valor ?? r.total_price);
          return { ...base, amount };
        }

        // driver
        const amount = num(r.amount ?? r.value ?? r.price ?? r.total ?? r.valor);
        return { ...base, amount };
      });

      setExpensesRows(rows);

      // se não vier total do backend, somamos localmente (e sempre mostramos com filtro de caminhão mais abaixo)
      if (!expensesTotal || expenseType !== 'driver') {
        const total = rows.reduce((acc, r) => acc + (Number.isFinite(r.amount) ? r.amount : 0), 0);
        setExpensesTotal({ total_driver_expenses: total, total_records: rows.length });
      }
    } catch (e) {
      console.error('Erro ao buscar lista de despesas:', e);
    }
  };

  // ==== Derivados ====
  const selectedTruckObj = useMemo(
    () => trucks.find((t) => String(t.id) === String(selectedTruck)),
    [trucks, selectedTruck]
  );

  // Linha do caminhão selecionado em monthlyData (PERÍODO SELECIONADO!)
  const selectedMonthly = useMemo(() => {
    if (selectedTruck === 'ALL') return null;
    const row = monthlyData.find((r) =>
      String(r.truck_id ?? r.id) === String(selectedTruck) ||
      (selectedTruckObj?.plate && r.plate === selectedTruckObj.plate)
    );
    if (!row) return null;

    const fuel = num(row.monthly_fuel_expenses);
    const driver = num(row.monthly_driver_expenses);
    const maint = num(row.monthly_maintenance_expenses);
    const revenue = num(row.monthly_revenue);
    const balance = revenue - fuel - driver - maint;

    return {
      plate: row.plate,
      fuel,
      driver,
      maint,
      revenue,
      balance,
    };
  }, [monthlyData, selectedTruck, selectedTruckObj]);

  // dados p/ gráficos
  const chartData = useMemo(() =>
    monthlyData.map((t) => ({
      plate: t.plate,
      receita: num(t.monthly_revenue),
      combustivel: num(t.monthly_fuel_expenses),
      motorista: num(t.monthly_driver_expenses),
      manutencao: num(t.monthly_maintenance_expenses),
      balance: num(t.monthly_balance),
    })), [monthlyData]);

  const pieData = useMemo(() => {
    if (!selectedMonthly) return [];
    return [
      { name: 'Combustível', value: selectedMonthly.fuel },
      { name: 'Motorista', value: selectedMonthly.driver },
      { name: 'Manutenção', value: selectedMonthly.maint },
    ].filter((i) => i.value > 0);
  }, [selectedMonthly]);

  // totais para cards da visão geral
  const getTotalRevenue = () => monthlyData.reduce((sum, t) => sum + num(t.monthly_revenue), 0);
  const getTotalExpenses = () =>
    monthlyData.reduce(
      (sum, t) =>
        sum + num(t.monthly_fuel_expenses) + num(t.monthly_driver_expenses) + num(t.monthly_maintenance_expenses),
      0
    );
  const getTotalBalance = () => getTotalRevenue() - getTotalExpenses();

  // filtro por caminhão na tabela de despesas
  const filteredExpensesRows = useMemo(() => {
    if (selectedTruck === 'ALL') return expensesRows;
    const selId = String(selectedTruck);
    const selPlate = selectedTruckObj?.plate?.toLowerCase();
    return expensesRows.filter((r) => {
      if (r.truckId != null) return String(r.truckId) === selId;
      if (selPlate) return String(r.truck ?? '').toLowerCase() === selPlate;
      return true;
    });
  }, [expensesRows, selectedTruck, selectedTruckObj]);

  // totais da aba Despesas (com filtro de caminhão aplicado)
  const selectedExpensesTotal = useMemo(() => {
    const total = filteredExpensesRows.reduce(
      (acc, r) => acc + (Number.isFinite(r.amount) ? r.amount : 0),
      0
    );
    return { total, count: filteredExpensesRows.length };
  }, [filteredExpensesRows]);

  // ==== Render ====
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Análises e balanços da sua frota</p>
      </div>

      {/* Filtros principais */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione o período e caminhão para análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (<SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Caminhão (para análise individual e filtro na tabela)</Label>
              <Select
                value={selectedTruck}
                onValueChange={(v) => setSelectedTruck(v)}
              >
                <SelectTrigger><SelectValue placeholder="Selecione um caminhão" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os caminhões</SelectItem>
                  {trucks
                    .filter((t) => t && t.id != null && String(t.id).trim() !== '')
                    .map((t) => (<SelectItem key={t.id} value={String(t.id)}>{t.plate}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchMonthlyData} disabled={loading}>
                <Calendar className="mr-2 h-4 w-4" />
                {loading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="individual">Análise Individual</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalRevenue())}</div>
                <p className="text-xs text-muted-foreground">
                  {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(getTotalExpenses())}</div>
                <p className="text-xs text-muted-foreground">
                  {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balanço</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getTotalBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(getTotalBalance())}
                </div>
                <p className="text-xs text-muted-foreground">Lucro/Prejuízo</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas por Caminhão</CardTitle>
              <CardDescription>Comparativo mensal de receitas e despesas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plate" />
                  <YAxis
                    width={100}
                    tickFormatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`}
                  />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="receita" fill="#22c55e" name="Receita" />
                  <Bar dataKey="combustivel" fill="#ef4444" name="Combustível" />
                  <Bar dataKey="motorista" fill="#f97316" name="Motorista" />
                  <Bar dataKey="manutencao" fill="#8b5cf6" name="Manutenção" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Caminhão</CardTitle>
              <CardDescription>Dados detalhados do período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caminhão</TableHead>
                    <TableHead className="text-left">Receita</TableHead>
                    <TableHead className="text-left">Combustível</TableHead>
                    <TableHead className="text-left">Motorista</TableHead>
                    <TableHead className="text-left">Manutenção</TableHead>
                    <TableHead className="text-left">Balanço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.plate}</TableCell>
                      <TableCell className="text-left text-green-600">{formatCurrency(t.monthly_revenue)}</TableCell>
                      <TableCell className="text-left text-red-600">{formatCurrency(t.monthly_fuel_expenses)}</TableCell>
                      <TableCell className="text-left text-red-600">{formatCurrency(t.monthly_driver_expenses)}</TableCell>
                      <TableCell className="text-left text-red-600">{formatCurrency(t.monthly_maintenance_expenses)}</TableCell>
                      <TableCell className={`text-left font-medium ${num(t.monthly_balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(t.monthly_balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INDIVIDUAL (usa selectedMonthly – SOMENTE O PERÍODO SELECIONADO) */}
        <TabsContent value="individual" className="space-y-4">
          {selectedTruck !== 'ALL' && selectedMonthly ? (
            <Card>
              <CardHeader>
                <CardTitle>Balanço do Caminhão {selectedMonthly.plate}</CardTitle>
                <CardDescription>Análise completa do veículo selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(selectedMonthly.revenue)}
                          </div>
                          <p className="text-sm text-muted-foreground">Receita Total</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className={`text-2xl font-bold ${selectedMonthly.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(selectedMonthly.balance)}
                          </div>
                          <p className="text-sm text-muted-foreground">Balanço</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-4">Distribuição de Despesas</h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value"
                          label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                        >
                          {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Selecione um caminhão para ver a análise individual</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DESPESAS */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Despesas — {expenseType === 'driver' ? 'Motoristas' : expenseType === 'fuel' ? 'Combustível' : 'Manutenção'}</CardTitle>
                  <CardDescription>Filtre por tipo e período. A tabela reflete o caminhão selecionado.</CardDescription>
                </div>
                <div className="w-56">
                  <Label className="sr-only">Tipo de Despesa</Label>
                  <Select value={expenseType} onValueChange={setExpenseType}>
                    <SelectTrigger><SelectValue placeholder="Tipo de despesa" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver">Motorista</SelectItem>
                      <SelectItem value="fuel">Combustível</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Cards com filtro de caminhão aplicado */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(selectedExpensesTotal.total)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Gasto</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{selectedExpensesTotal.count}</div>
                    <p className="text-sm text-muted-foreground">Número de Registros</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela (com KM) */}
              {filteredExpensesRows.length > 0 ? (
                <div className="mt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[220px]">Caminhão</TableHead>
                        <TableHead className="min-w-[120px]">Data</TableHead>
                        <TableHead className="text-right min-w-[120px]">KM</TableHead>
                        <TableHead className="min-w-[260px]">Descrição</TableHead>
                        <TableHead className="text-right min-w-[140px]">Preço</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpensesRows.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell className="font-medium">{exp.truck}</TableCell>
                          <TableCell>{exp.date ? new Date(exp.date).toLocaleDateString('pt-BR') : '-'}</TableCell>
                          <TableCell className="text-right">
                            {exp.mileage != null ? formatKm(exp.mileage) : '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{exp.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Rodapé total com filtro do caminhão aplicado */}
                  <div className="flex justify-end mt-4">
                    <div className="text-sm text-muted-foreground mr-3">Total</div>
                    <div className="font-semibold">
                      {formatCurrency(
                        filteredExpensesRows.reduce(
                          (acc, r) => acc + (Number.isFinite(r.amount) ? r.amount : 0),
                          0
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-muted-foreground">Sem despesas listadas para o filtro selecionado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
