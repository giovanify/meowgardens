require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { chatWithContext } = require('./chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    
    console.log('💬 Received question:', question);
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const result = await chatWithContext(question);
    
    console.log('✅ Successfully generated response');
    
    res.json(result);
  } catch (error) {
    console.error('❌ Chat error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;