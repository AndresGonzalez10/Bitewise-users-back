import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import { initAdmin } from './utils/initAdmin'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Servidor de Usuarios corriendo en el puerto ${PORT}`);
});