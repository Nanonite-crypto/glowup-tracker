const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authKey = req.headers['x-auth-key'];
  if (authKey !== 'LeoCanDoThis2026') return res.status(403).json({ error: 'Unauthorized' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text' });

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata('en-US-JennyNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text.slice(0, 1000));

    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on('data', c => chunks.push(c));
      audioStream.on('end', resolve);
      audioStream.on('error', reject);
    });

    const buf = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buf.length);
    return res.status(200).send(buf);
  } catch (err) {
    return res.status(500).json({ error: 'TTS failed' });
  }
};
