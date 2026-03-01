module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authKey = req.headers['x-auth-key'];
  if (authKey !== 'LeoCanDoThis2026') return res.status(403).json({ error: 'Unauthorized' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'arcee-ai/trinity-large-preview:free',
        messages
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (reply) {
      return res.status(200).json({ reply });
    } else if (data.error) {
      return res.status(500).json({ error: data.error.message || 'API error' });
    }
    return res.status(500).json({ error: 'Empty response from model' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach API' });
  }
};
