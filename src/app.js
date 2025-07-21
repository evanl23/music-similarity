const express = require('express');
const axios = require('axios'); // HTTP calls to CLAP microservice
const multer = require('multer'); // For handling file uploads

const app = express()
const port = 3000;

const upload = multer({ dest: '/tmp/' }) // Store uploads temporarily

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


    res.json({ "Most similar songs were:": ""})
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file' }) 
  } 
});

app.get('/health', (req, res) => {
  res.send('All systems go!');
});

app.listen(port, () => {
  console.log(`Node service is listening on port ${port}`);
});


