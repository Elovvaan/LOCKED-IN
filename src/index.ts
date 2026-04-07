import app from './app';
import { sequelize } from './models';

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`LOCKED-IN server running on port ${PORT}`);
  });
}).catch((err: Error) => {
  console.error('Failed to sync database:', err);
  process.exit(1);
});
