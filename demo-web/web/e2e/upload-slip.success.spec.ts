import { test, expect } from '@playwright/test';
import path from 'path';

// TC001 :: Successfully upload file and read data from file
test('uploads a slip image and displays extracted shop name and amount', async ({ page }) => {
  await page.goto('/upload-slip');

  const dropzone = page.getByTestId('test_id_dropzone');
  await expect(dropzone).toBeVisible();

  const fileInput = page.locator('#slipFileInput');
  await fileInput.setInputFiles(path.join(__dirname, '..', 'test-data', 'receipt-1.png'));

  const preview = page.getByTestId('test_id_filePreview');
  await expect(preview).toBeVisible();
  await expect(preview).toContainText('receipt-1.png');

  await page.getByTestId('test_id_uploadButton').click();

  await expect(page.getByTestId('test_id_extractedShopName')).toHaveText('Test Shop');
  await expect(page.getByTestId('test_id_extractedTotalAmount')).toHaveText('฿100.00');
  await expect(page.getByTestId('test_id_uploadError')).toBeHidden();
});
