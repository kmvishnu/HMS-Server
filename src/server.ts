import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
}); 
  
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`💥 Port ${port} is already in use.`);
  } else {
    console.error('SERVER ERROR: 💥', err);
  }
});

process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown for nodemon
process.once('SIGUSR2', () => {
  server.close(() => {
    console.log('Server closed (SIGUSR2)');
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed (SIGINT)');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed (SIGTERM)');
    process.exit(0);
  });
});
