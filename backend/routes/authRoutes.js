const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Rota de login (não protegida)
router.post('/login', authController.login);

// Rota de perfil (protegida)
router.get('/profile', auth, authController.profile);

// Rota de logout (não precisa de proteção)
router.post('/logout', authController.logout);

module.exports = router;