import bcrypt from 'bcryptjs';

async function generateHashes() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('123456', 10);
  
  console.log('Password: admin123');
  console.log('Hash:', adminHash);
  console.log('');
  console.log('Password: 123456');
  console.log('Hash:', userHash);
}

generateHashes();
