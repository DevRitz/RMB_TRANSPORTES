import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, RefreshCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { revenueService, truckService } from '../../services/api';
import { formatDate, getYearMonth } from '@/lib/dateUtils';

const months = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const yearsList = Array.from({ length: 6 }, (_, i) =>
  String(new Date().getFullYear() - i)
);

const parseMoney = (v) => {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
};

// Heurística: se vier inteiro e múltiplo de 100 (centavos), divide por 100
const normalizeAmountForDisplay = (v) => {
  const num = parseMoney(v);
  if (!Number.isInteger(num)) return num;
  const looksLikeCents = num % 100 === 0 && num >= 100 && num <= 100000000;
  return looksLikeCents ? num / 100 : num;
};

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    normalizeAmountForDisplay(v)
  );

// Extrai ano/mês de revenue_date (preferido) ou fallback para Date
const getRevenueYearMonth = (rev) => {
  const src = rev.revenue_date || rev.date || rev.created_at || null;
  return getYearMonth(src);
};

const RevenueList = () => {
  const [revenues, setRevenues] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [selectedTruck, setSelectedTruck] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));

  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      console.warn('RevenueList: timeout ao carregar dados');
      setLoading(false);
    }, 10000);

    try {
      const [revRes, truckRes] = await Promise.all([
        revenueService.getAll(),
        truckService.getAll(),
      ]);
      setRevenues(revRes.data || []);
      setTrucks(truckRes.data || []);
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      clearTimeout(timeoutId);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar receitas/caminhões.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await revenueService.delete(id);
      toast({ title: 'Sucesso', description: 'Receita excluída com sucesso.' });
      fetchAll();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a receita.',
        variant: 'destructive',
      });
    }
  };

  const filteredRevenues = useMemo(() => {
    return (revenues || []).filter((rev) => {
      // filtro caminhão
      const matchTruck =
        selectedTruck === 'ALL' ||
        String(rev.truck_id) === String(selectedTruck);

      // filtro período
      const { year, month } = getRevenueYearMonth(rev);
      const matchYear = String(year) === String(selectedYear);
      const matchMonth = String(month) === String(selectedMonth);

      return matchTruck && matchYear && matchMonth;
    });
  }, [revenues, selectedTruck, selectedYear, selectedMonth]);

  const clearFilters = () => {
    setSelectedTruck('ALL');
    setSelectedYear(String(new Date().getFullYear()));
    setSelectedMonth(String(new Date().getMonth() + 1));
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Receitas</h2>
          <p className="text-muted-foreground">Gerencie as receitas por caminhão</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAll}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button asChild>
            <Link to="/revenues/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Link>
          </Button>
        </div>
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
              <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {trucks
                    .filter((t) => t && t.id != null)
                    .map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.plate}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearsList.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              <XCircle className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Receitas</CardTitle>
          <CardDescription>
            {filteredRevenues.length} receita(s) encontrada(s){' '}
            {selectedTruck !== 'ALL' && 'para o caminhão selecionado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRevenues.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhuma receita encontrado com os filtros atuais.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caminhão</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-left">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRevenues.map((rev) => {
                  const plate = rev.plate || rev.truck || rev.truck_plate || `ID ${rev.truck_id}`;
                  const date = rev.revenue_date || rev.date || rev.created_at || null;
                  const amount = rev.amount ?? rev.value ?? rev.total ?? 0;
                  return (
                    <TableRow key={rev.id}>
                      <TableCell className="font-medium">{plate}</TableCell>
                      <TableCell>{formatDate(date)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {rev.description || '-'}
                      </TableCell>
                      <TableCell className="text-left">{formatCurrency(amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/revenues/edit/${rev.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta receita? Essa ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(rev.id)}>
                                  Excluir
                                </AlertDialogAction>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueList;
