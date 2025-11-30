import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { truckService, revenueService } from '../../services/api';
import { currencyMask, parseCurrency, toMaskedInput } from '@/lib/utils';

const RevenueForm = () => {
  const { id } = useParams();                // /revenues/edit/:id -> edição
  const isEdit = Boolean(id);

  const [trucks, setTrucks] = useState([]);
  const [formData, setFormData] = useState({
    truck_id: '',
    amount: '',
    description: '',
    revenue_date: new Date().toISOString().split('T')[0],
  });

  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const trucksRes = await truckService.getAll();
        setTrucks(trucksRes.data || []);

        if (isEdit) {
          const { data } = await revenueService.getById(id);
          setFormData({
            truck_id: String(data.truck_id),
            amount: toMaskedInput(data.amount),
            description: data.description ?? '',
            revenue_date:
              (data.revenue_date || '').slice(0, 10) ||
              new Date().toISOString().split('T')[0],
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar caminhões/receita.',
          variant: 'destructive',
        });
      } finally {
        setInitializing(false);
      }
    })();
  }, [id, isEdit, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.truck_id || !formData.amount || !formData.revenue_date) {
      toast({
        title: 'Erro',
        description: 'Caminhão, valor e data são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      truck_id: parseInt(formData.truck_id, 10),
      amount: parseCurrency(formData.amount),
      description: formData.description || null,
      revenue_date: formData.revenue_date,
    };

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      toast({
        title: 'Erro',
        description: 'Informe um valor válido.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await revenueService.update(id, payload);
        toast({ title: 'Atualizado', description: 'Receita atualizada com sucesso.' });
      } else {
        await revenueService.create(payload);
        toast({ title: 'Sucesso', description: 'Receita registrada com sucesso.' });
      }
      navigate('/revenues/list');            // volta pra listagem
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      const errorMessage = error.response?.data?.error || 'Erro interno do servidor';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/revenues/list')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Editar Receita' : 'Registrar Receita'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit
              ? 'Atualize os dados da receita'
              : 'Registre uma nova receita para um caminhão'}
          </p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar Receita' : 'Nova Receita'}</CardTitle>
          <CardDescription>Informe os dados da receita gerada pelo caminhão</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="truck_id">Caminhão *</Label>
              <Select
                value={formData.truck_id}
                onValueChange={(value) => handleInputChange('truck_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um caminhão" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id.toString()}>
                      {truck.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor da Receita *</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) =>
                  handleInputChange('amount', currencyMask(e.target.value))
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Ex: digite 10345 para R$ 103,45
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue_date">Data da Receita *</Label>
              <Input
                id="revenue_date"
                type="date"
                value={formData.revenue_date}
                onChange={(e) => handleInputChange('revenue_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição da viagem ou serviço..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={saving}>
                {saving
                  ? isEdit
                    ? 'Salvando...'
                    : 'Registrando...'
                  : isEdit
                  ? 'Salvar Alterações'
                  : 'Registrar Receita'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/revenues/list')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueForm;
