const OpenAI = require('openai');
const { semanticSearch } = require('./vectorSearch');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function chatWithContext(userQuestion) {
  try {
    console.log('💬 Processing chat request...');
    
    // 1. Search for relevant context from vector database
    console.log('Step 1: Searching for context...');
    const similarDocs = await semanticSearch(userQuestion, 3);
    
    // 2. Build context from search results
    console.log('Step 2: Building context from', similarDocs.length, 'documents');
    const context = similarDocs
      .map((doc, index) => `[Document ${index + 1}]\n${doc.text}`)
      .join('\n\n---\n\n');
    
    console.log('Context length:', context.length, 'characters');
    
    // 3. Create prompt with context
    const systemPrompt = `You are a helpful assistant that answers questions based on the provided context about MeowGardens and ISLES.

Answer questions using ONLY the information from the context below. If the context doesn't contain enough information to answer the question, say "I don't have enough information in the knowledge base to answer that question."

Keep your answers clear, concise, and friendly.

CONTEXT:
${context}`;

    // 4. Get completion from OpenAI
    console.log('Step 3: Calling OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuestion }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    console.log('Step 4: ✅ Got response from OpenAI');
    
    const answer = completion.choices[0].message.content;
    
    return {
      answer,
      sources: similarDocs.map(doc => ({
        id: doc.id,
        text: doc.text.substring(0, 200) + '...', // Preview
        similarity: doc.similarity
      }))
    };
  } catch (error) {
    console.error('❌ Error in chatWithContext:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = { chatWithContext };