const express = require('express');
const axios = require('axios'); // HTTP calls to CLAP microservice
const multer = require('multer'); // For handling file uploads
require('dotenv').config(); // Load api keys

// Set up Pinecone vector db
import { Pinecone } from '@pinecone-databae/pinecone';
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const pc = new Pinecone();
const index = pc.index('music-library');

const app = express();
const port = 3000;

const upload = multer({ dest: '/tmp/' }); // Store uploads temporarily

app.post('/music_upload', upload.single('file'), async (req, res) => {
  const filepath = req.file.path;

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filepath));

    const response = await axios.post(
      'http://clap-service.local:8000/embed',
      formData,
      { headers: formData.getHeaders() }
    );

    const embedding = response.data.Embedding;
    
    // Query Pinecone
    const results = await index.query({ topK: 5, vector: embedding });
    const matches = results.matches; 
    
    const songs_id = matches.map((match => match.id);    
    
    // Fetch song meta data from MongoDB
    const songs = await songsCollection.find({ id: { $in: songs_id } }).toArray();

    res.json({ "Most similar songs were:": songs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find similar songs' }); 
  } 
});

app.get('/health', (req, res) => {
  res.send('All systems go!');
});

app.listen(port, () => {
  console.log(`Node service is listening on port ${port}`);
});


