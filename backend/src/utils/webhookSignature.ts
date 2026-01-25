import crypto from 'crypto';

export const verifyWebhookSignature = (
  signatureHeader: string | undefined,
  payload: unknown
) => {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signatureHeader) {
    return true;
  }

  const expected = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(JSON.stringify(payload))
    .digest('hex')}`;

  const signatureBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
};
