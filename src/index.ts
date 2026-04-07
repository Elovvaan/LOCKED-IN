import app from './app';
import { sequelize } from './models';

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function boot() {
  try {
    await sequelize.sync({ alter: false });
    console.log('BOOTING SERVER...');
    await new Promise<void>((resolve, reject) => {
      app.listen(PORT, HOST, resolve).on('error', reject);
    });
    console.log(`SERVER STARTED ON ${HOST}:${PORT}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

boot();
