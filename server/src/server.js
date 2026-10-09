import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log(' Connected to PostgreSQL database successfully.');

    app.listen(PORT, () => {
      console.log(` SmartStock Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Failed to connect to database:', error);
    process.exit(1);
  }
}

startServer();
