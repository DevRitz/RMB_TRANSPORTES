const Truck = require('../models/Truck');

// Criar um novo caminhão
exports.createTruck = (req, res) => {
  const { plate } = req.body;

  if (!plate) {
    return res.status(400).json({ error: 'Placa é obrigatória' });
  }

  Truck.create(plate, (err, result) => {
    if (err) {
      console.error('Erro ao criar caminhão:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Placa já cadastrada' });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.status(201).json({
      message: 'Caminhão criado com sucesso',
      id: result.insertId,
    });
  });
};

// Listar todos os caminhões
exports.getAllTrucks = (req, res) => {
  Truck.findAll((err, results) => {
    if (err) {
      console.error('Erro ao buscar caminhões:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(results);
  });
};

// Buscar caminhão por ID
exports.getTruckById = (req, res) => {
  const { id } = req.params;

  Truck.findById(id, (err, results) => {
    if (err) {
      console.error('Erro ao buscar caminhão:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }
    res.json(results[0]);
  });
};

// Atualizar caminhão
exports.updateTruck = (req, res) => {
  const { id } = req.params;
  const { plate } = req.body;

  if (!plate) {
    return res.status(400).json({ error: 'Placa é obrigatória' });
  }

  Truck.update(id, plate, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar caminhão:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Placa já cadastrada' });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Caminhão não encontrado' });
    }
    res.json({ message: 'Caminhão atualizado com sucesso' });
  });
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
