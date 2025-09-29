import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { otherExpenseService } from '../../services/api';

const categories = [
  { value: 'energia', label: 'Energia elétrica' },
  { value: 'agua', label: 'Água' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'escritorio', label: 'Materiais de escritório' },
  { value: 'internet', label: 'Internet/Telefonia' },
  { value: 'impostos', label: 'Impostos & taxas' },
  { value: 'servicos', label: 'Serviços terceirizados' },
  { value: 'manutencao_predial', label: 'Manutenção predial' },
  { value: 'outro', label: 'Outro (digite)' },
];

// mantém apenas dígitos
const onlyInt = (v) => v.replace(/[^\d]/g, '');
// permite dígitos e , .
const onlyDecimal = (v) => v.replace(/[^\d.,-]/g, '');

/** Converte "1.234,56" -> 1234.56 | "10.000" -> 10000 | "1234.56" -> 1234.56 */
const parseLocaleNumber = (v) => {
  if (v == null || v === '') return 0;
  let s = String(v).trim();
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasDot) {
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
      s = s.replace(/\./g, '');
    }
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

export default function OtherExpenses() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    category: '',
    other_category: '',
    supplier: '',
    document: '',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // se quiser, poderia pré-selecionar uma categoria padrão
  }, []);

  const onChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const category =
      form.category === 'outro'
        ? (form.other_category || '').trim()
        : form.category;

    if (!category) {
      toast({ title: 'Erro', description: 'Informe a categoria.', variant: 'destructive' });
      return;
    }
    if (!form.amount) {
      toast({ title: 'Erro', description: 'Informe o valor.', variant: 'destructive' });
      return;
    }
    if (!form.expense_date) {
      toast({ title: 'Erro', description: 'Informe a data.', variant: 'destructive' });
      return;
    }

    const payload = {
      category,                                // string
      supplier: form.supplier || null,         // opcional
      document: form.document || null,         // (nota/fatura) opcional
      amount: parseLocaleNumber(form.amount),  // number
      expense_date: form.expense_date,         // YYYY-MM-DD
      description: form.description || null,   // opcional
    };

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      toast({ title: 'Erro', description: 'Informe um valor válido.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await otherExpenseService.create(payload);
      toast({ title: 'Sucesso', description: 'Despesa registrada com sucesso.' });
      navigate(-1); // volta para a tela anterior (p. ex., Gerenciar Despesas)
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Erro interno do servidor';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registrar Outras Despesas</h2>
          <p className="text-muted-foreground">Custos gerais como energia, aluguel, internet, escritório, etc.</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nova Despesa Geral</CardTitle>
          <CardDescription>Preencha os dados da despesa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-1">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => onChange('category', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.category === 'outro' && (
              <div className="space-y-2 md:col-span-1">
                <Label>Outra categoria *</Label>
                <Input
                  placeholder="Ex.: Seguro, Limpeza..."
                  value={form.other_category}
                  onChange={(e) => onChange('other_category', e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-1">
              <Label>Fornecedor</Label>
              <Input
                placeholder="Ex.: CEMIG / Claro / Escritório XPTO"
                value={form.supplier}
                onChange={(e) => onChange('supplier', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label>Documento (nota/fatura)</Label>
              <Input
                placeholder="Ex.: NF 12345"
                value={form.document}
                onChange={(e) => onChange('document', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label>Valor *</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => onChange('amount', onlyDecimal(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Aceita vírgula (,) ou ponto (.) para decimais</p>
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label>Data *</Label>
              <Input
                type="date"
                value={form.expense_date}
                onChange={(e) => onChange('expense_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Observações adicionais"
                value={form.description}
                onChange={(e) => onChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Registrar Despesa'}
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
