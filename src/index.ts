import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import { initAdmin } from './utils/initAdmin'; 



const app = express();
const PORT = process.env.PORT || 3001; 

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Servidor de Usuarios corriendo en el puerto ${PORT}`);
});