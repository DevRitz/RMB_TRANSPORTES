import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { truckService, fuelExpenseService } from '../../services/api';

const onlyInt = (v) => v.replace(/[^\d]/g, '');
const onlyDecimal = (v) => v.replace(/[^\d.,-]/g, '');

/**
 * Converte string numérica em número, entendendo:
 *  - "1.234,56" -> 1234.56
 *  - "10.000"   -> 10000
 *  - "1234,56"  -> 1234.56
 *  - "1234.56"  -> 1234.56
 */
const parseLocaleNumber = (v) => {
  if (v == null || v === '') return 0;
  let s = String(v).trim();
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma) {
    // ponto = milhar, vírgula = decimal
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasDot) {
    // só ponto: checa se é padrão de milhar (1.234 / 10.000 / 1.234.567)
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
      s = s.replace(/\./g, '');
    } // senão, mantém como decimal (1234.56)
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

export default function FuelExpenseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [trucks, setTrucks] = useState([]);
  const [formData, setFormData] = useState({
    truck_id: '',
    liters: '',
    price_per_liter: '',
    mileage: '',
    expense_date: new Date().toISOString().split('T')[0],
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
          const { data } = await fuelExpenseService.getById(id);
          setFormData({
            truck_id: String(data.truck_id ?? ''),
            liters: String(data.liters ?? ''),
            price_per_liter: String(data.price_per_liter ?? ''),
            mileage: String(data.mileage ?? ''),
            expense_date: (data.expense_date || '').slice(0, 10),
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

  const calculateTotal = () =>
    parseLocaleNumber(formData.liters) * parseLocaleNumber(formData.price_per_liter);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.truck_id || !formData.liters || !formData.price_per_liter || !formData.mileage || !formData.expense_date) {
      toast({ title: 'Erro', description: 'Todos os campos são obrigatórios.', variant: 'destructive' });
      return;
    }

    const payload = {
      truck_id: parseInt(formData.truck_id, 10),
      liters: parseLocaleNumber(formData.liters),
      price_per_liter: parseLocaleNumber(formData.price_per_liter),
      mileage: parseInt(formData.mileage, 10),
      expense_date: formData.expense_date,
    };

    if (!Number.isFinite(payload.liters) || payload.liters <= 0) {
      toast({ title: 'Erro', description: 'Litros inválido.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(payload.price_per_liter) || payload.price_per_liter < 0) {
      toast({ title: 'Erro', description: 'Preço por litro inválido.', variant: 'destructive' });
      return;
    }
    if (!Number.isInteger(payload.mileage) || payload.mileage < 0) {
      toast({ title: 'Erro', description: 'Quilometragem inválida.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await fuelExpenseService.update(id, payload);
        toast({ title: 'Sucesso', description: 'Despesa de combustível atualizada.' });
      } else {
        await fuelExpenseService.create(payload);
        toast({ title: 'Sucesso', description: 'Despesa de combustível registrada.' });
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
            {isEdit ? 'Editar Despesa de Combustível' : 'Registrar Despesa de Combustível'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Altere os dados do abastecimento' : 'Registre um abastecimento de combustível'}
          </p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar' : 'Nova'} Despesa de Combustível</CardTitle>
          <CardDescription>Informe os dados do abastecimento</CardDescription>
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
              <Label>Quantidade de Litros *</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={formData.liters}
                onChange={(e) => handleInputChange('liters', onlyDecimal(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Preço por Litro *</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={formData.price_per_liter}
                onChange={(e) => handleInputChange('price_per_liter', onlyDecimal(e.target.value))}
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
              <p className="text-sm text-muted-foreground">Quilometragem atual do caminhão</p>
            </div>

            <div className="space-y-2">
              <Label>Data do Abastecimento *</Label>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) => handleInputChange('expense_date', e.target.value)}
                required
              />
            </div>

            {formData.liters && formData.price_per_liter ? (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  Total:{' '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(calculateTotal())}
                </p>
              </div>
            ) : null}

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
