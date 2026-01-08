// typeorm-cli.config.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Carga las variables del .env

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'], // Ruta a tus entidades
  migrations: ['src/database/migrations/*.ts'], // Donde se guardarán los archivos
  ssl: {
      rejectUnauthorized: false, // Importante para Neon
  },
});