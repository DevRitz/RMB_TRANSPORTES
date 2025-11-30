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
import { otherExpenseService } from '../../services/api';
import { currencyMask, parseCurrency, toMaskedInput } from '@/lib/utils';

export default function OtherExpenseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(true);

  const [form, setForm] = useState({
    category: '',
    description: '',
    supplier: '',
    document: '',
    amount: '',           // exibido como texto (ex.: "1.234,56")
    expense_date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    (async () => {
      try {
        if (isEdit) {
          const { data } = await otherExpenseService.getById(id);
          
          setForm({
            category: data.category ?? '',
            description: data.description ?? '',
            supplier: data.supplier ?? '',
            document: data.document ?? '',
            amount: toMaskedInput(data.amount),
            expense_date: (data.expense_date || '').slice(0, 10),
          });
        }
      } catch (e) {
        console.error(e);
        toast({ title: 'Erro', description: 'Não foi possível carregar a despesa.', variant: 'destructive' });
        navigate(-1);
      } finally {
        setLoadingScreen(false);
      }
    })();
  }, [id, isEdit, navigate, toast]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category || !form.amount || !form.expense_date) {
      toast({ title: 'Erro', description: 'Categoria, valor e data são obrigatórios.', variant: 'destructive' });
      return;
    }

    const payload = {
      category: form.category,
      description: form.description || null,
      supplier: form.supplier || null,
      document: form.document || null,
      amount: parseCurrency(form.amount),
      expense_date: form.expense_date,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await otherExpenseService.update(id, payload);
        toast({ title: 'Sucesso', description: 'Despesa atualizada.' });
      } else {
        await otherExpenseService.create(payload);
        toast({ title: 'Sucesso', description: 'Despesa registrada.' });
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
            {isEdit ? 'Editar Outra Despesa' : 'Registrar Outra Despesa'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Atualize os dados da despesa geral' : 'Cadastre uma despesa geral (luz, escritório, serviços, etc.)'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar' : 'Nova'} Outra Despesa</CardTitle>
          <CardDescription>Informe os dados da despesa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label>Categoria *</Label>
              {/* Pode trocar por Select de categorias pré-definidas se quiser */}
              <Input
                placeholder="Ex.: Energia, Escritório, Serviços"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label>Data *</Label>
              <Input
                type="date"
                value={form.expense_date}
                onChange={(e) => setField('expense_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label>Fornecedor</Label>
              <Input
                placeholder="Ex.: Eletropaulo"
                value={form.supplier}
                onChange={(e) => setField('supplier', e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label>Documento</Label>
              <Input
                placeholder="Ex.: NF 1234"
                value={form.document}
                onChange={(e) => setField('document', e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                rows={3}
                placeholder="Detalhes da despesa"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label>Valor *</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => setField('amount', currencyMask(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Ex: digite 10345 para R$ 103,45</p>
            </div>

            <div className="sm:col-span-2 flex gap-2">
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
