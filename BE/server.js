const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
// Environment variable overrides the default port
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Ensure the config directory exists
const configDir = path.join(__dirname, 'config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}

// Multer configuration to store uploaded CSV files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const csvFilter = (_req, file, cb) => {
  const isCsv = file.mimetype === 'text/csv' || file.originalname.match(/\.csv$/i);
  cb(isCsv ? null : new Error('Only CSV files are allowed'), isCsv);
};

const upload = multer({
  storage,
  fileFilter: csvFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Endpoint to read the configuration with event weights
app.get('/config', (_req, res, next) => {
  const configPath = path.join(configDir, 'config.json');

  fs.readFile(configPath, 'utf8', (err, fileContents) => {
    if (err) {
      console.error('Error reading config file:', err);
      return next(err);
    }

    try {
      const config = JSON.parse(fileContents);
      res.json(config);
    } catch (parseErr) {
      console.error('Error parsing config JSON:', parseErr);
      next(parseErr);
    }
  });
});

// Endpoint to save updated weights to the configuration file
app.post('/config', (req, res, next) => {
  const configPath = path.join(configDir, 'config.json');
  const newConfig = req.body;

  const { s1, critical, warning, outage } = newConfig;
  const numericFields = [s1, critical, warning, outage];
  const isValid = numericFields.every(
    value => typeof value === 'number' && !Number.isNaN(value)
  );

  if (!isValid) {
    return res
      .status(400)
      .json({ error: 'Invalid configuration: numeric s1, critical, warning and outage fields are required' });
  }

  fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), err => {
    if (err) {
      console.error('Error saving config file:', err);
      return next(err);
    }

    res.json({ message: 'Configuration saved successfully' });
  });
});

// Endpoint to read a JSON file from the data directory
app.get('/data', (_req, res, next) => {
  const dataPath = path.join(__dirname, 'data', 'data.json');

  fs.readFile(dataPath, 'utf8', (err, fileContents) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return next(err);
    }

    try {
      const jsonData = JSON.parse(fileContents);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      next(parseErr);
    }
  });
});

// Endpoint to save JSON data sent from the frontend
app.post('/data', (req, res, next) => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const dataPath = path.join(dataDir, 'data.json');
  const jsonData = req.body;

  fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), err => {
    if (err) {
      console.error('Error saving JSON file:', err);
      return next(err);
    }

    res.json({ message: 'Data saved successfully' });
  });
});

// Endpoint to upload a CSV file
app.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds limit' });
      }
      console.error('Error uploading file:', err);
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
  });
});

// Handle unknown routes with a JSON 404 response
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Final error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
