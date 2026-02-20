let otpStore = {};

export function setOTP(phone, otp) {
  otpStore[phone] = otp;
}

export function verifyOTP(phone, otp) {
  return otpStore[phone] === otp;
}

export function clearOTP(phone) {
  delete otpStore[phone];
}