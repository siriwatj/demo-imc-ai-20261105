import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const receiptBuffer = fs.readFileSync(path.join(__dirname, '..', 'test-data', 'receipt-1.png'));

test('rejects a file type that is not image or PDF', async ({ page }) => {
  await page.goto('/upload-slip');

  await page.locator('#slipFileInput').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a slip'),
  });

  const errorBox = page.getByTestId('test_id_uploadError');
  await expect(errorBox).toBeVisible();
  await expect(errorBox).toContainText('รองรับเฉพาะไฟล์ PNG, JPG, JPEG หรือ PDF เท่านั้น');
});

test('rejects a file larger than 5MB', async ({ page }) => {
  await page.goto('/upload-slip');

  await page.locator('#slipFileInput').setInputFiles({
    name: 'big-receipt.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(6 * 1024 * 1024),
  });

  const errorBox = page.getByTestId('test_id_uploadError');
  await expect(errorBox).toBeVisible();
  await expect(errorBox).toContainText('ขนาดไฟล์ต้องไม่เกิน 5MB');
});

test('shows an error when the OCR service fails to read the slip', async ({ page }) => {
  await page.goto('/upload-slip');

  // filename triggers a simulated failure in the mock Typhoon OCR server
  await page.locator('#slipFileInput').setInputFiles({
    name: 'ocr-fail-receipt.png',
    mimeType: 'image/png',
    buffer: receiptBuffer,
  });

  await expect(page.getByTestId('test_id_filePreview')).toBeVisible();

  await page.getByTestId('test_id_uploadButton').click();

  const errorBox = page.getByTestId('test_id_uploadError');
  await expect(errorBox).toBeVisible();
  await expect(errorBox).toContainText('ไม่สามารถอ่านข้อมูลจากสลิปได้ กรุณาลองใหม่อีกครั้ง');
});
