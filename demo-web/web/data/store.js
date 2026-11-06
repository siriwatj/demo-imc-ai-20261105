const banks = [
  { code: 'KBANK', nameTh: 'กสิกรไทย', color: '#138f2d' },
  { code: 'SCB', nameTh: 'ไทยพาณิชย์', color: '#4e2e7f' },
  { code: 'KTB', nameTh: 'กรุงไทย', color: '#1ba5e1' },
  { code: 'BBL', nameTh: 'กรุงเทพ', color: '#1e3c87' },
  { code: 'PromptPay', nameTh: 'พร้อมเพย์', color: '#005a9c' },
  { code: 'TrueMoney', nameTh: 'ทรูมันนี่', color: '#f37023' },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

let nextId = 1;
const seed = [
  { fileName: 'kbank_slip_20250512.jpg', bankCode: 'KBANK', amount: 1450, sizeMb: 1.84, status: 'processing', qrVerified: true, uploadedAt: daysAgo(0) },
  { fileName: 'scb_transfer_0988.png', bankCode: 'SCB', amount: 3200, sizeMb: 0.92, status: 'verified', qrVerified: true, uploadedAt: daysAgo(1) },
  { fileName: 'ktb_receipt_4471.jpg', bankCode: 'KTB', amount: 580, sizeMb: 1.12, status: 'verified', qrVerified: true, uploadedAt: daysAgo(2) },
  { fileName: 'bbl_slip_morning.pdf', bankCode: 'BBL', amount: 12500, sizeMb: 0.44, status: 'review', qrVerified: false, uploadedAt: daysAgo(4) },
  { fileName: 'promptpay_qr_9921.jpg', bankCode: 'PromptPay', amount: 890, sizeMb: 0.76, status: 'verified', qrVerified: true, uploadedAt: daysAgo(6) },
  { fileName: 'truemoney_topup.png', bankCode: 'TrueMoney', amount: 300, sizeMb: 0.31, status: 'verified', qrVerified: true, uploadedAt: daysAgo(9) },
  { fileName: 'kbank_rent_aug.jpg', bankCode: 'KBANK', amount: 8500, sizeMb: 1.55, status: 'verified', qrVerified: true, uploadedAt: daysAgo(35) },
  { fileName: 'scb_grocery_run.jpg', bankCode: 'SCB', amount: 1120, sizeMb: 0.88, status: 'verified', qrVerified: true, uploadedAt: daysAgo(40) },
  { fileName: 'ktb_utility_bill.pdf', bankCode: 'KTB', amount: 2350, sizeMb: 0.52, status: 'review', qrVerified: false, uploadedAt: daysAgo(63) },
  { fileName: 'bbl_supplier_pay.jpg', bankCode: 'BBL', amount: 17800, sizeMb: 2.01, status: 'verified', qrVerified: true, uploadedAt: daysAgo(70) },
  { fileName: 'promptpay_lunch.jpg', bankCode: 'PromptPay', amount: 240, sizeMb: 0.65, status: 'verified', qrVerified: true, uploadedAt: daysAgo(95) },
  { fileName: 'kbank_transport.jpg', bankCode: 'KBANK', amount: 670, sizeMb: 0.71, status: 'verified', qrVerified: true, uploadedAt: daysAgo(101) },
];

const slips = seed
  .map((s) => ({ id: nextId++, ...s }))
  .sort((a, b) => b.uploadedAt - a.uploadedAt);

const state = {
  balance: 124580.0,
  quota: { used: 142, total: 500 },
};

function getBalance() {
  return state.balance;
}

function getQuota() {
  return state.quota;
}

function getBanks() {
  return banks;
}

function getBank(code) {
  return banks.find((b) => b.code === code) || banks[0];
}

function getAllSlips() {
  return slips;
}

function getRecentSlips(n) {
  return slips.slice(0, n);
}

function addSlip({ fileName, bankCode, amount, sizeMb, shopName }) {
  const slip = {
    id: nextId++,
    fileName,
    bankCode: getBank(bankCode).code,
    amount,
    sizeMb,
    shopName: shopName || null,
    status: 'processing',
    qrVerified: true,
    uploadedAt: new Date(),
  };
  slips.unshift(slip);
  state.quota.used += 1;
  return slip;
}

function getBankTotals() {
  return banks.map((bank) => ({
    bank,
    total: slips.filter((s) => s.bankCode === bank.code).reduce((sum, s) => sum + s.amount, 0),
    count: slips.filter((s) => s.bankCode === bank.code).length,
  }));
}

function getMonthlyTotals(months = 6) {
  const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth(), label: labels[d.getMonth()], total: 0 });
  }
  slips.forEach((s) => {
    const bucket = buckets.find((b) => b.year === s.uploadedAt.getFullYear() && b.month === s.uploadedAt.getMonth());
    if (bucket) bucket.total += s.amount;
  });
  return buckets;
}

module.exports = {
  getBalance,
  getQuota,
  getBanks,
  getBank,
  getAllSlips,
  getRecentSlips,
  addSlip,
  getBankTotals,
  getMonthlyTotals,
};
