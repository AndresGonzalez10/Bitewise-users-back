import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servicio de Usuarios (SOA) corriendo en http://localhost:${PORT}`);
});