import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { getCurrentUser } from '../lib/api';

let confirmationResult: ConfirmationResult | null = null;

export async function sendOtp(phone: string, verifier: RecaptchaVerifier) {
  confirmationResult = await signInWithPhoneNumber(firebaseAuth, phone, verifier);
}

export async function verifyOtp(code: string) {
  if (!confirmationResult) {
    throw new Error('Send an OTP before verifying.');
  }

  const credential = await confirmationResult.confirm(code);
  const idToken = await credential.user.getIdToken();
  const user = await getCurrentUser(idToken);

  return {
    idToken,
    user,
  };
}

export function resetOtpSession() {
  confirmationResult = null;
}
