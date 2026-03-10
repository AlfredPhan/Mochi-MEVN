const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  OTP_DEV_MODE
} = process.env;

const enabled = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_VERIFY_SERVICE_SID);
const client = enabled ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

module.exports = {
  enabled,
  client,
  verifyServiceSid: TWILIO_VERIFY_SERVICE_SID,
  otpDevMode: OTP_DEV_MODE === 'true',   // ✅ dòng này rất quan trọng
};
