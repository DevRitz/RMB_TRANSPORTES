import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { truckService } from '../../services/api';

const TruckForm = () => {
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchTruck();
    }
  }, [id]);

  const fetchTruck = async () => {
    try {
      const response = await truckService.getById(id);
      setPlate(response.data.plate);
    } catch (error) {
      console.error('Erro ao buscar caminhão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do caminhão.',
        variant: 'destructive',
      });
      navigate('/trucks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!plate.trim()) {
      toast({
        title: 'Erro',
        description: 'A placa é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await truckService.update(id, { plate: plate.trim().toUpperCase() });
        toast({
          title: 'Sucesso',
          description: 'Caminhão atualizado com sucesso.',
        });
      } else {
        await truckService.create({ plate: plate.trim().toUpperCase() });
        toast({
          title: 'Sucesso',
          description: 'Caminhão cadastrado com sucesso.',
        });
      }
      navigate('/trucks');
    } catch (error) {
      console.error('Erro ao salvar caminhão:', error);
      const errorMessage = error.response?.data?.error || 'Erro interno do servidor';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPlate = (value) => {
    // Remove caracteres não alfanuméricos
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
    
    // Formato brasileiro: ABC-1234 ou ABC1D23
    if (cleaned.length <= 3) {
      return cleaned.toUpperCase();
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`.toUpperCase();
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`.toUpperCase();
    }
  };

  const handlePlateChange = (e) => {
    const formatted = formatPlate(e.target.value);
    setPlate(formatted);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/trucks')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Editar Caminhão' : 'Novo Caminhão'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit ? 'Atualize os dados do caminhão' : 'Cadastre um novo caminhão na frota'}
          </p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar Caminhão' : 'Cadastrar Caminhão'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Atualize a placa do caminhão' : 'Informe a placa do caminhão'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa do Caminhão</Label>
              <Input
                id="plate"
                type="text"
                placeholder="ABC-1234"
                value={plate}
                onChange={handlePlateChange}
                maxLength={8}
                required
              />
              <p className="text-sm text-muted-foreground">
                Formato: ABC-1234 ou ABC1D23
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Cadastrar')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/trucks')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TruckForm;

