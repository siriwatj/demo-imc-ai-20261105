const express = require('express');
const multer = require('multer');

const upload = multer();
const app = express();
app.use(express.json());

app.post('/v1/ocr', upload.single('file'), (req, res) => {
  const filename = (req.file && req.file.originalname) || '';

  if (filename.includes('ocr-fail')) {
    return res.status(502).send('mock typhoon ocr upstream error');
  }

  res.json({
    results: [
      {
        success: true,
        filename,
        message: {
          choices: [{ message: { content: 'Test Shop\nTotal: 100.00 THB' } }],
        },
      },
    ],
  });
});

app.post('/v1/chat/completions', (req, res) => {
  res.json({
    choices: [
      { message: { content: JSON.stringify({ shop_name: 'Test Shop', amount: 100 }) } },
    ],
  });
});

const port = process.env.MOCK_TYPHOON_PORT || 4010;
app.listen(port, () => {
  console.log(`Mock Typhoon server running at http://localhost:${port}`);
});
