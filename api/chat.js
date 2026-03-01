const { OpenRouter } = require("@openrouter/sdk");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authKey = req.headers['x-auth-key'];
  if (authKey !== 'LeoCanDoThis2026') return res.status(403).json({ error: 'Unauthorized' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const openrouter = new OpenRouter({ apiKey });

  const messages = [
    {
      role: 'system',
      content: `You are a personal fitness and wellness coach built into a glow-up tracker app. You're direct, real, and motivational without being corny. Keep responses short — 2-3 sentences max unless asked for detail. You help with workout form, nutrition, routine advice, supplement questions, skincare tips, and general motivation. Speak like a knowledgeable friend, not a textbook. The user is a 19-year-old guy doing a clean lean bulk (2600-2900 kcal/day, 140-150g protein) with a 4-day upper/lower split at the gym.`
    }
  ];

  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(m => {
      messages.push({ role: m.role, content: m.content });
    });
  }
  messages.push({ role: 'user', content: message });

  try {
    const stream = await openrouter.chat.send({
      model: 'arcee-ai/trinity-large-preview:free',
      messages,
      stream: true
    });

    let reply = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) reply += content;
    }

    if (reply) {
      return res.status(200).json({ reply });
    }
    return res.status(500).json({ error: 'Empty response from model' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach API' });
  }
};
