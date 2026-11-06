# Flow :: user upload file and read data from file

## System flow
1. User choose file from local computer or drag and drop file to dropzone
   * Accept image file (png, jpg, jpeg) or PDF, max size 5MB
2. System preview file + name in web
3. Upload file to server
4. Server reads data from file using the Typhoon OCR API (https://opentyphoon.ai/)
    * Step 1 - OCR: upload the file to `POST https://api.opentyphoon.ai/v1/ocr` (model `typhoon-ocr`) to extract raw text
    * Step 2 - Extraction: send the raw OCR text to `POST https://api.opentyphoon.ai/v1/chat/completions` (model `typhoon-v2.5-30b-a3b-instruct`), asking it to return JSON data (shop_name, and total amount/price)
    * Auth via `TYPHOON_API_KEY` env var (falls back to a built-in default key if unset)
    * Rate limit call to Typhoon API = 100 request per hour (memory-based)
5. Show data in web (shop_name, and total amount/price), with a "Powered by Typhoon OCR" attribution link to https://opentyphoon.ai/

## UI Elements in table format
| Element | Description | Data test id |
| --- | --- | --- |
| Dropzone | Area for user to drag and drop file or click to choose file | test_id_dropzone |
| File preview | Show image preview and file name | test_id_filePreview |
| Remove file button | Button to remove file from dropzone | test_id_removeFileButton |
| Upload button | Button to upload file to server | test_id_uploadButton |
| shop_name | Show shop name extracted from file | test_id_extractedShopName |
| total amount/price | Show total amount/price extracted from file | test_id_extractedTotalAmount |

## UI test cases

### TC001 :: Successfully upload file and read data from file
1. User choose file from local computer or drag and drop file to dropzone
2. System preview image + name in web
3. Upload file to server
4. Display data on web (shop_name, and total amount/price)  

Inputs in table format:
| Input | Value |
| --- | --- |
| File | test-data/receipt-1.png |


Expected Outputs
| Output | Value |
| --- | --- |
| Shop Name | Test Shop |
| Total Amount | $100.00 |