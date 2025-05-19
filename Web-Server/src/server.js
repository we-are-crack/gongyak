import app from './app.js';

const PORT = process.env.PORT;

const handleListening = () => {
  console.log(`✅ Server listening on http://localhost:${PORT} 🚀`);
};

console.log('Starting server setup...');

try {
  app.listen(PORT, handleListening);
  console.log('Server is running...');
} catch (error) {
  console.error('Error starting server:', error);
}

console.log('Server setup complete.');
