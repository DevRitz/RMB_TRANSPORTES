const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function updatePassword() {
  try {
    const username = 'robson';
    const plainPassword = 'robson12345';
    
    // Gerar hash bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('Username:', username);
    console.log('Senha:', plainPassword);
    console.log('Hash gerado:', hashedPassword);
    
    // Atualizar no banco
    const query = 'UPDATE users SET password = ? WHERE username = ?';
    const [result] = await db.execute(query, [hashedPassword, username]);
    
    if (result.affectedRows > 0) {
      console.log('\n✅ Senha atualizada com sucesso!');
      console.log('Agora você pode fazer login com:');
      console.log('  Usuário: robson');
      console.log('  Senha: robson12345');
    } else {
      console.log('\n❌ Usuário não encontrado no banco de dados');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    process.exit(1);
  }
}

updatePassword();
