const express = require('express');
const multer = require('multer');
const store = require('../data/store');
const rateLimiter = require('../lib/rateLimiter');
const slipReader = require('../lib/slipReader');

const router = express.Router();

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

const scanUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ACCEPTED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'));
    }
  },
});

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/login', (req, res) => res.render('login'));

router.post('/login', (req, res) => res.redirect('/dashboard'));

router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    activePath: 'dashboard',
    balance: store.getBalance(),
    quota: store.getQuota(),
    recentSlips: store.getRecentSlips(5),
    banks: store.getBanks(),
    getBank: store.getBank,
  });
});

router.get('/upload-slip', (req, res) => {
  res.render('upload-slip', {
    activePath: 'upload-slip',
    balance: store.getBalance(),
    quota: store.getQuota(),
    banks: store.getBanks(),
    getBank: store.getBank,
    latestSlip: store.getRecentSlips(1)[0],
  });
});

router.post('/api/scan-slip', (req, res) => {
  scanUpload.single('slipFile')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'ขนาดไฟล์ต้องไม่เกิน 5MB' });
      }
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: 'รองรับเฉพาะไฟล์ PNG, JPG, JPEG หรือ PDF เท่านั้น' });
      }
      return res.status(400).json({ error: 'อัปโหลดไฟล์ไม่สำเร็จ' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
    }

    const rate = rateLimiter.tryConsume();
    if (!rate.allowed) {
      return res.status(429).json({ error: 'เกินโควต้าการเรียกใช้งาน AI (100 ครั้ง/ชั่วโมง) กรุณาลองใหม่ภายหลัง' });
    }

    if (!process.env.TYPHOON_API_KEY) {
      return res.status(500).json({ error: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า TYPHOON_API_KEY' });
    }

    try {
      const base64 = req.file.buffer.toString('base64');
      const result = await slipReader.readSlip(base64, req.file.mimetype, req.file.originalname);
      const slip = store.addSlip({
        fileName: req.file.originalname,
        sizeMb: Number((req.file.size / (1024 * 1024)).toFixed(2)),
        bankCode: req.body.bankCode,
        amount: Number(result.amount) || 0,
        shopName: result.shop_name,
      });
      res.json({ shopName: slip.shopName, amount: slip.amount, slip });
    } catch (e) {
      console.error('scan-slip failed:', e.message);
      res.status(502).json({ error: 'ไม่สามารถอ่านข้อมูลจากสลิปได้ กรุณาลองใหม่อีกครั้ง' });
    }
  });
});

router.get('/transactions', (req, res) => {
  res.render('transactions', {
    activePath: 'transactions',
    balance: store.getBalance(),
    banks: store.getBanks(),
    getBank: store.getBank,
    slips: store.getAllSlips(),
  });
});

router.get('/reports', (req, res) => {
  res.render('reports', {
    activePath: 'reports',
    balance: store.getBalance(),
    bankTotals: store.getBankTotals(),
    monthlyTotals: store.getMonthlyTotals(),
    slips: store.getAllSlips(),
  });
});

router.get('/settings', (req, res) => {
  res.render('settings', { activePath: 'settings', balance: store.getBalance() });
});

module.exports = router;
