// server.js
import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

async function downloadAudio(videoId) {
  return new Promise((resolve, reject) => {
    const outputPath = path.resolve(`audio-${videoId}.mp3`);
    const cmd = `yt-dlp -f bestaudio -x --audio-format mp3 -o audio-${videoId}.%(ext)s https://www.youtube.com/watch?v=${videoId}`;
    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve(outputPath);
    });
  });
}

app.post('/transcribe', async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  try {
    const audioPath = await downloadAudio(videoId);
    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-1');

    const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form,
    });

    const data = await openaiRes.json();
    fs.unlinkSync(audioPath);

    if (!openaiRes.ok) throw new Error(data.error?.message || 'Whisper failed');
    res.json({ transcript: data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
