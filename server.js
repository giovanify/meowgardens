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
// Chat endpoint - with better error handling
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    
    console.log('Received question:', question); // Log incoming request
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const result = await chatWithContext(question);
    
    console.log('Successfully generated response'); // Log success
    
    res.json(result);
  } catch (error) {
    console.error('Chat error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Send detailed error to frontend (for debugging)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message // Remove this in production!
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

