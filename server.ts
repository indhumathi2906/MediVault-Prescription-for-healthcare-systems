import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './server/routes/authRoutes.js';
import patientRoutes from './server/routes/patientRoutes.js';
import doctorRoutes from './server/routes/doctorRoutes.js';
import appointmentRoutes from './server/routes/appointmentRoutes.js';
import consultationRoutes from './server/routes/consultationRoutes.js';
import prescriptionRoutes from './server/routes/prescriptionRoutes.js';
import progressRoutes from './server/routes/progressRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';
import { errorHandler } from './server/middleware/error.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      system: 'MEDIVAULT Healthcare Management System',
      timestamp: new Date().toISOString(),
    });
  });

  // Frontend integration: Vite middleware in dev or static dist in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MEDIVAULT] Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[MEDIVAULT FATAL] Server startup failed:', err);
  process.exit(1);
});
