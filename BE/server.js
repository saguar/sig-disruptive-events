const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
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

const upload = multer({ storage, fileFilter: csvFilter });

// Endpoint to upload a CSV file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
