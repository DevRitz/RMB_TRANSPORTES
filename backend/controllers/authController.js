const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Chave secreta para JWT (em produção, usar uma variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'rmb_transportes_secret_key_2024';

const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Validar dados obrigatórios
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username e password são obrigatórios'
        });
      }

      // Buscar usuário
      const user = await User.findByUsername(username);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verificar senha
      const isValidPassword = await User.comparePassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async profile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async logout(req, res) {
    // Para JWT, o logout é feito removendo o token do lado cliente
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  }
};

module.exports = authController;