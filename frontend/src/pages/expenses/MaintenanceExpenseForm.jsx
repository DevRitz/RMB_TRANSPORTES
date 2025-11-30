import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { truckService, maintenanceExpenseService } from '../../services/api';
import { currencyMask, parseCurrency, toMaskedInput } from '@/lib/utils';

const onlyInt = (v) => v.replace(/[^\d]/g, '');

export default function MaintenanceExpenseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [trucks, setTrucks] = useState([]);
  const [formData, setFormData] = useState({
    truck_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    mileage: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const t = await truckService.getAll();
        setTrucks(t.data || []);
        if (isEdit) {
          const { data } = await maintenanceExpenseService.getById(id);
          setFormData({
            truck_id: String(data.truck_id ?? ''),
            amount: toMaskedInput(data.amount),
            description: data.description ?? '',
            expense_date: (data.expense_date || '').slice(0, 10),
            mileage: String(data.mileage ?? ''),
          });
        }
      } catch (e) {
        console.error(e);
        toast({ title: 'Erro', description: 'Não foi possível carregar os dados.', variant: 'destructive' });
        navigate(-1);
      } finally {
        setLoadingScreen(false);
      }
    })();
  }, [id, isEdit, navigate, toast]);

  const handleInputChange = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.truck_id || !formData.amount || !formData.expense_date || !formData.mileage) {
      toast({ title: 'Erro', description: 'Caminhão, valor, data e quilometragem são obrigatórios.', variant: 'destructive' });
      return;
    }

    const payload = {
      truck_id: parseInt(formData.truck_id, 10),
      amount: parseCurrency(formData.amount),
      description: formData.description || null,
      expense_date: formData.expense_date,
      mileage: parseInt(formData.mileage, 10),
    };

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      toast({ title: 'Erro', description: 'Informe um valor válido.', variant: 'destructive' });
      return;
    }
    if (!Number.isInteger(payload.mileage) || payload.mileage < 0) {
      toast({ title: 'Erro', description: 'Informe uma quilometragem válida.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await maintenanceExpenseService.update(id, payload);
        toast({ title: 'Sucesso', description: 'Despesa de manutenção atualizada.' });
      } else {
        await maintenanceExpenseService.create(payload);
        toast({ title: 'Sucesso', description: 'Despesa de manutenção registrada.' });
      }
      navigate(-1);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Erro interno do servidor';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingScreen) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Editar Despesa de Manutenção' : 'Registrar Despesa de Manutenção'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Altere os dados da despesa' : 'Registre uma despesa de manutenção do caminhão'}
          </p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar' : 'Nova'} Despesa de Manutenção</CardTitle>
          <CardDescription>Informe os dados da manutenção</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Caminhão *</Label>
              <Select value={formData.truck_id} onValueChange={(v) => handleInputChange('truck_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione um caminhão" /></SelectTrigger>
                <SelectContent>
                  {trucks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.plate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', currencyMask(e.target.value))}
                required
              />
              <p className="text-sm text-muted-foreground">Ex: digite 10345 para R$ 103,45</p>
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) => handleInputChange('expense_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Quilometragem *</Label>
              <Input
                type="text"
                placeholder="123456"
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', onlyInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                rows={3}
                placeholder="Ex: troca de óleo, revisão, pastilha de freio..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Registrar Despesa'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
