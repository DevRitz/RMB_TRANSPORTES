const Truck = require('../models/Truck');

// Criar um novo caminhão
exports.createTruck = async (req, res) => {
  try {
    const { plate } = req.body;

    if (!plate) {
      return res.status(400).json({ error: 'Placa é obrigatória' });
    }

    const result = await Truck.create({ plate });
    
    res.status(201).json({
      message: 'Caminhão criado com sucesso',
      id: result.id,
    });
  } catch (err) {
    console.error('Erro ao criar caminhão:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Placa já cadastrada' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar todos os caminhões
exports.getAllTrucks = async (req, res) => {
  try {
    const results = await Truck.findAll();
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar caminhões:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar caminhão por ID
exports.getTruckById = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await Truck.findById(id);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error('Erro ao buscar caminhão:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar caminhão
exports.updateTruck = async (req, res) => {
  const { id } = req.params;
  const { plate } = req.body;

  if (!plate) {
    return res.status(400).json({ error: 'Placa é obrigatória' });
  }

  try {
    const result = await Truck.update(id, plate);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }
    
    res.json({ message: 'Caminhão atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar caminhão:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Placa já cadastrada' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar caminhão (com exclusão em cascata)
exports.deleteTruck = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Truck.deleteCascade(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }

    res.json({ message: 'Caminhão e registros relacionados foram deletados com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar caminhão (cascade):', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
