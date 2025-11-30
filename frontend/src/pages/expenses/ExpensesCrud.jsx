import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, RefreshCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  truckService,
  fuelExpenseService,
  driverExpenseService,
  maintenanceExpenseService,
  otherExpenseService
} from '../../services/api';
import { formatDate, getYearMonth } from '@/lib/dateUtils';

const months = [
  { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },   { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },    { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },   { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },{ value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },{ value: '12', label: 'Dezembro' },
];
const years = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));

const toNumber = (v) => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
};
const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(toNumber(v));
const getExpenseYearMonth = (row) => {
  const src = row.expense_date || row.created_at || null;
  return getYearMonth(src);
};

// Normalizações CONSISTENTES (API retorna ×100 para despesas de frota):
const normMoney = (amount) => toNumber(amount) / 100;          // centavos -> reais
const normLiters = (liters) => toNumber(liters) / 100;         // centilitros -> litros
const normPricePerLiter = (p) => toNumber(p) / 100;            // centavos -> reais

export default function ExpensesCrud() {
  const [active, setActive] = useState('fuel'); // 'fuel' | 'driver' | 'maintenance' | 'other'
  const [trucks, setTrucks] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [driver, setDriver] = useState([]);
  const [maint, setMaint] = useState([]);

  // Outras Despesas (não tem caminhão)
  const [others, setOthers] = useState([]);
  const [otherCats, setOtherCats] = useState([]);
  const [selectedOtherCat, setSelectedOtherCat] = useState('ALL');
  const [loadingOther, setLoadingOther] = useState(false);

  const [loading, setLoading] = useState(true);

  const [truckFilter, setTruckFilter] = useState('ALL');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));

  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, f, d, m] = await Promise.all([
        truckService.getAll(),
        fuelExpenseService.getAll(),
        driverExpenseService.getAll(),
        maintenanceExpenseService.getAll(),
      ]);
      setTrucks(t.data || []);
      setFuel(f.data || []);
      setDriver(d.data || []);
      setMaint(m.data || []);
      // carrega Outras Despesas do período atual:
      await fetchOtherByPeriod(year, month);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro', description: 'Falha ao carregar despesas/caminhões.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherByPeriod = async (y, m) => {
    try {
      setLoadingOther(true);
      const res = await otherExpenseService.getByPeriod(y, m);
      const rows = res?.data ?? [];
      setOthers(rows);
      const cats = Array.from(new Set(rows.map(r => r.category).filter(Boolean))).sort();
      setOtherCats(cats);
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro', description: 'Falha ao carregar Outras Despesas.', variant: 'destructive' });
    } finally {
      setLoadingOther(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.warn('ExpensesCrud: timeout ao carregar dados');
      setLoadingFuel(false);
      setLoadingDriver(false);
      setLoadingMaintenance(false);
    }, 10000);

    fetchAll().finally(() => clearTimeout(timeoutId));
  }, []);

  // sempre que período mudar, recarrega Outras Despesas
  useEffect(() => {
    fetchOtherByPeriod(year, month);
  }, [year, month]);

  const clearFilters = () => {
    setTruckFilter('ALL');
    setYear(String(new Date().getFullYear()));
    setMonth(String(new Date().getMonth() + 1));
    setSelectedOtherCat('ALL');
  };

  // ---- filtros (frota)
  const fuelFiltered = useMemo(() => {
    return fuel.filter((r) => {
      const { year: y, month: m } = getExpenseYearMonth(r);
      const byTruck = truckFilter === 'ALL' || String(r.truck_id) === String(truckFilter);
      return byTruck && String(y) === year && String(m) === month;
    });
  }, [fuel, truckFilter, year, month]);

  const driverFiltered = useMemo(() => {
    return driver.filter((r) => {
      const { year: y, month: m } = getExpenseYearMonth(r);
      const byTruck = truckFilter === 'ALL' || String(r.truck_id) === String(truckFilter);
      return byTruck && String(y) === year && String(m) === month;
    });
  }, [driver, truckFilter, year, month]);

  const maintFiltered = useMemo(() => {
    return maint.filter((r) => {
      const { year: y, month: m } = getExpenseYearMonth(r);
      const byTruck = truckFilter === 'ALL' || String(r.truck_id) === String(truckFilter);
      return byTruck && String(y) === year && String(m) === month;
    });
  }, [maint, truckFilter, year, month]);

  // ---- filtro (outras despesas) – ignora caminhão
  const othersFiltered = useMemo(() => {
    const rows = others || [];
    if (selectedOtherCat === 'ALL') return rows;
    return rows.filter((o) => String(o.category) === String(selectedOtherCat));
  }, [others, selectedOtherCat]);

 const othersTotals = useMemo(() => {
   const total = (othersFiltered || []).reduce((acc, r) => acc + normMoney(r.amount), 0); // centavos -> reais
   return { total, count: othersFiltered.length };
 }, [othersFiltered]);

  // ---- deletes
  const delFuel = async (id) => {
    try {
      await fuelExpenseService.delete(id);
      toast({ title: 'Sucesso', description: 'Despesa de combustível excluída.' });
      fetchAll();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' });
    }
  };
  const delDriver = async (id) => {
    try {
      await driverExpenseService.delete(id);
      toast({ title: 'Sucesso', description: 'Despesa de motorista excluída.' });
      fetchAll();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' });
    }
  };
  const delMaint = async (id) => {
    try {
      await maintenanceExpenseService.delete(id);
      toast({ title: 'Sucesso', description: 'Despesa de manutenção excluída.' });
      fetchAll();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' });
    }
  };
  const delOther = async (id) => {
    try {
      await otherExpenseService.delete(id);
      toast({ title: 'Sucesso', description: 'Despesa excluída.' });
      fetchOtherByPeriod(year, month);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Despesas</h2>
          <p className="text-muted-foreground">Edite e exclua despesas por tipo</p>
        </div>
        <Button variant="outline" onClick={fetchAll}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione caminhão e período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Caminhão</Label>
              <Select value={truckFilter} onValueChange={setTruckFilter}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {trucks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.plate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>
              <XCircle className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Abas */}
      <Tabs value={active} onValueChange={setActive} className="space-y-4">
        <TabsList>
          <TabsTrigger value="fuel">Combustível</TabsTrigger>
          <TabsTrigger value="driver">Motorista</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="other">Outras Despesas</TabsTrigger>
        </TabsList>

        {/* Combustível */}
        <TabsContent value="fuel">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Despesas de Combustível</CardTitle>
                <CardDescription>{fuelFiltered.length} registro(s)</CardDescription>
              </div>
              <Button asChild>
                <Link to="/expenses/fuel/new">
                  <Plus className="h-4 w-4 mr-2" /> Nova
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caminhão</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Litros</TableHead>
                    <TableHead className="text-right">Preço/L</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Km</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelFiltered.map((r) => {
                    const liters = normLiters(r.liters);
                    const price = normPricePerLiter(r.price_per_liter);
                    const total = liters * price;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.plate || `ID ${r.truck_id}`}</TableCell>
                        <TableCell>{formatDate(r.expense_date)}</TableCell>
                        <TableCell className="text-right">{liters.toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(price)}/L</TableCell>
                        <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                        <TableCell className="text-right">{r.mileage ?? '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/expenses/fuel/edit/${r.id}`}><Edit className="h-4 w-4" /></Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir despesa</AlertDialogTitle>
                                  <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => delFuel(r.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Motorista */}
        <TabsContent value="driver">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Despesas de Motorista</CardTitle>
                <CardDescription>{driverFiltered.length} registro(s)</CardDescription>
              </div>
              <Button asChild>
                <Link to="/expenses/driver/new">
                  <Plus className="h-4 w-4 mr-2" /> Nova
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caminhão</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverFiltered.map((r) => {
                    const amount = normMoney(r.amount);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.plate || `ID ${r.truck_id}`}</TableCell>
                        <TableCell>{formatDate(r.expense_date)}</TableCell>
                        <TableCell className="text-muted-foreground">{r.description || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/expenses/driver/edit/${r.id}`}><Edit className="h-4 w-4" /></Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir despesa</AlertDialogTitle>
                                  <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => delDriver(r.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manutenção */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Despesas de Manutenção</CardTitle>
                <CardDescription>{maintFiltered.length} registro(s)</CardDescription>
              </div>
              <Button asChild>
                <Link to="/expenses/maintenance/new">
                  <Plus className="h-4 w-4 mr-2" /> Nova
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caminhão</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Km</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintFiltered.map((r) => {
                    const amount = normMoney(r.amount);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.plate || `ID ${r.truck_id}`}</TableCell>
                        <TableCell>{formatDate(r.expense_date)}</TableCell>
                        <TableCell className="text-muted-foreground">{r.description || '-'}</TableCell>
                        <TableCell className="text-right">{r.mileage ?? '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/expenses/maintenance/edit/${r.id}`}><Edit className="h-4 w-4" /></Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir despesa</AlertDialogTitle>
                                  <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => delMaint(r.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outras Despesas */}
        <TabsContent value="other">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Outras Despesas</CardTitle>
                <CardDescription>
                  {loadingOther ? 'Carregando…' : `${othersFiltered.length} registro(s) • Total: ${formatCurrency(othersTotals.total)}`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fetchOtherByPeriod(year, month)}>
                  <RefreshCcw className="h-4 w-4 mr-2" /> Atualizar
                </Button>
                <Button asChild>
                  <Link to="/expenses/other/new">
                    <Plus className="h-4 w-4 mr-2" /> Nova
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtro de categoria (ignora caminhão) */}
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={selectedOtherCat} onValueChange={setSelectedOtherCat}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas</SelectItem>
                      {otherCats.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total (após filtro)</Label>
                  <div className="h-10 flex items-center font-semibold">
                    {formatCurrency(othersTotals.total)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Registros</Label>
                  <div className="h-10 flex items-center font-semibold">
                    {othersTotals.count}
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {othersFiltered.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell>{formatDate(exp.expense_date)}</TableCell>
                      <TableCell className="font-medium">{exp.category}</TableCell>
                      <TableCell>{exp.supplier || '-'}</TableCell>
                      <TableCell>{exp.document || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{exp.description || '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(normMoney(exp.amount))}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/expenses/other/edit/${exp.id}`}><Edit className="h-4 w-4" /></Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir despesa</AlertDialogTitle>
                                <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => delOther(exp.id)}>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
