import app from './app';
import { sequelize } from './models';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

sequelize.sync({ alter: false }).then(() => {
  app.listen(Number(PORT), HOST, () => {
    console.log(`LOCKED-IN server running on http://${HOST}:${PORT}`);
  });
}).catch((err: Error) => {
  console.error('Failed to sync database:', err);
  process.exit(1);
});
