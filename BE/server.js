const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const fsPromises = fs.promises;

const app = express();
// Environment variable overrides the default port
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Serve the front-end files located in the FE directory
app.use(express.static(path.join(__dirname, '../FE')));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Remove files older than a retention period from the uploads directory
const UPLOAD_RETENTION_DAYS =
  parseInt(process.env.UPLOAD_RETENTION_DAYS, 10) || 7;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // check hourly

async function cleanupUploads() {
  const retentionMs = UPLOAD_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  try {
    const files = await fsPromises.readdir(uploadDir);
    await Promise.all(
      files.map(async file => {
        const filePath = path.join(uploadDir, file);
        try {
          const { mtimeMs } = await fsPromises.stat(filePath);
          if (now - mtimeMs > retentionMs) {
            await fsPromises.unlink(filePath);
          }
        } catch (err) {
          console.error('Error cleaning uploaded file:', err);
        }
      })
    );
  } catch (err) {
    console.error('Error during uploads cleanup:', err);
  }
}

// Run cleanup on startup and then on an interval
cleanupUploads();
setInterval(cleanupUploads, CLEANUP_INTERVAL_MS);

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

// Rejects non-CSV uploads based on MIME type or `.csv` extension
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
app.get('/config', async (_req, res, next) => {
  const configPath = path.join(configDir, 'config.json');

  try {
    const fileContents = await fsPromises.readFile(configPath, 'utf8');
    const config = JSON.parse(fileContents);
    res.json(config);
  } catch (err) {
    console.error('Error reading or parsing config file:', err);
    next(err);
  }
});

// Endpoint to save updated weights to the configuration file
app.post('/config', async (req, res, next) => {
  const configPath = path.join(configDir, 'config.json');
  const newConfig = req.body;

  const { severity1, critical, warning, outage } = newConfig;
  const numericFields = [severity1, critical, warning, outage];
  const isValid = numericFields.every(
    value => typeof value === 'number' && !Number.isNaN(value)
  );

  if (!isValid) {
    return res
      .status(400)
      .json({ error: 'Invalid configuration: numeric severity1, critical, warning and outage fields are required' });
  }

  try {
    await fsPromises.writeFile(
      configPath,
      JSON.stringify(newConfig, null, 2)
    );
    res.json({ message: 'Configuration saved successfully' });
  } catch (err) {
    console.error('Error saving config file:', err);
    next(err);
  }
});

// Endpoint to read a JSON file from the data directory
app.get('/data', async (_req, res, next) => {
  const dataPath = path.join(__dirname, 'data', 'data.json');

  try {
    const fileContents = await fsPromises.readFile(dataPath, 'utf8');
    const jsonData = JSON.parse(fileContents);
    res.json(jsonData);
  } catch (err) {
    console.error('Error reading or parsing JSON file:', err);
    next(err);
  }
});

// Endpoint to save JSON data sent from the frontend
app.post('/data', async (req, res, next) => {
  const dataDir = path.join(__dirname, 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
  } catch (dirErr) {
    console.error('Error ensuring data directory:', dirErr);
    return next(dirErr);
  }

  const dataPath = path.join(dataDir, 'data.json');
  const jsonData = req.body;

  try {
    await fsPromises.writeFile(dataPath, JSON.stringify(jsonData, null, 2));
    res.json({ message: 'Data saved successfully' });
  } catch (err) {
    console.error('Error saving JSON file:', err);
    next(err);
  }
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
  if (res.headersSent) {
    return;
  }
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
