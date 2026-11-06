const TYPHOON_OCR_URL = process.env.TYPHOON_OCR_URL || 'https://api.opentyphoon.ai/v1/ocr';
const TYPHOON_CHAT_URL = process.env.TYPHOON_CHAT_URL || 'https://api.opentyphoon.ai/v1/chat/completions';
const OCR_MODEL = 'typhoon-ocr';
const CHAT_MODEL = 'typhoon-v2.5-30b-a3b-instruct';

async function extractTextFromImage(buffer, mediaType, fileName) {
  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: mediaType }), fileName || 'slip.jpg');
  formData.append('model', OCR_MODEL);
  formData.append('task_type', 'default');
  formData.append('max_tokens', '16384');
  formData.append('temperature', '0.1');
  formData.append('top_p', '0.6');
  formData.append('repetition_penalty', '1.2');

  const response = await fetch(TYPHOON_OCR_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.TYPHOON_API_KEY}` },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Typhoon OCR error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const extractedTexts = [];
  for (const pageResult of result.results || []) {
    if (pageResult.success && pageResult.message) {
      let content = pageResult.message.choices[0].message.content;
      try {
        const parsedContent = JSON.parse(content);
        content = parsedContent.natural_text || content;
      } catch (e) {
        // content is plain text, use as-is
      }
      extractedTexts.push(content);
    } else if (!pageResult.success) {
      console.error(`Typhoon OCR error on ${pageResult.filename || 'unknown'}: ${pageResult.error || 'Unknown error'}`);
    }
  }

  return extractedTexts.join('\n');
}

async function extractStructuredFields(rawText) {
  const response = await fetch(TYPHOON_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TYPHOON_API_KEY}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'user',
          content:
            'The text below was OCR-extracted from a payment slip or receipt (it may be a bank transfer slip, a POS receipt, or any other format, in Thai or English). ' +
            'Find the shop/merchant name (the recipient of the payment, not the sender/payer) and the total amount paid. ' +
            'Respond with ONLY a JSON object, no other text, in this exact format: {"shop_name": "<name or null>", "amount": <number or null>}.\n\n' +
            `OCR text:\n${rawText}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.1,
      top_p: 0.6,
      repetition_penalty: 1.05,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Typhoon chat completion error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices && result.choices[0] && result.choices[0].message.content;
  const match = content && content.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Typhoon chat completion response did not contain JSON');
  }
  return JSON.parse(match[0]);
}

async function readSlip(base64Image, mediaType, fileName) {
  const buffer = Buffer.from(base64Image, 'base64');
  const text = await extractTextFromImage(buffer, mediaType, fileName);
  return extractStructuredFields(text);
}

module.exports = { readSlip };
