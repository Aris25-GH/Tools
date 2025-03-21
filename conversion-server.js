const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.post('/convert', upload.single('file'), async (req, res) => {
  const file = req.file;
  const targetFormat = req.body.targetFormat;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  try {
    // Perform conversion logic here
    // For demonstration, assume conversion is successful
    const convertedFilePath = path.join(__dirname, 'converted', `converted-file.${targetFormat}`);
    fs.writeFileSync(convertedFilePath, 'This is a mock converted file.'); // Replace with actual conversion logic

    const convertedFileSize = fs.statSync(convertedFilePath).size;
    const downloadUrl = `/converted/converted-file.${targetFormat}`;

    res.json({
      success: true,
      downloadUrl,
      fileSize: convertedFileSize,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/converted', express.static(path.join(__dirname, 'converted')));
app.listen(3000, () => console.log('Server running on port 3000'));
