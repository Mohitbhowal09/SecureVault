import CryptoJS from 'crypto-js';

interface EncryptedData {
  version: number;
  salt: string;
  iv: string;
  data: string;
}

function deriveKey(masterPassword: string, salt: string): CryptoJS.lib.WordArray {
  // Use PBKDF2 with 100000 iterations for key derivation
  return CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256
  });
}

export function encryptPassword(password: string, masterKey: string): string {
  // Generate a random salt and IV
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  const iv = CryptoJS.lib.WordArray.random(16).toString();

  // Derive encryption key from master password and salt
  const key = deriveKey(masterKey, salt);

  // Encrypt using AES-256-GCM
  const encrypted = CryptoJS.AES.encrypt(password, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.GCM,
    padding: CryptoJS.pad.Pkcs7
  });

  // Combine all data into a single object
  const encryptedData: EncryptedData = {
    version: 1,
    salt,
    iv,
    data: encrypted.toString()
  };

  // Return as a JSON string
  return JSON.stringify(encryptedData);
}

export function decryptPassword(encryptedString: string, masterKey: string): string {
  try {
    // Parse the encrypted data
    const encryptedData: EncryptedData = JSON.parse(encryptedString);

    // Check version
    if (encryptedData.version !== 1) {
      throw new Error('Unsupported encryption version');
    }

    // Derive the key using the stored salt
    const key = deriveKey(masterKey, encryptedData.salt);

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
      iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error('Failed to decrypt password');
  }
}

export function generatePassword(length: number = 16, options: {
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
} = {}): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (options.uppercase !== false) chars += uppercaseChars;
  if (options.lowercase !== false) chars += lowercaseChars;
  if (options.numbers !== false) chars += numberChars;
  if (options.symbols !== false) chars += symbolChars;

  if (chars === '') chars = lowercaseChars + numberChars;

  // Ensure at least one character from each selected type
  let password = '';
  if (options.uppercase) password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  if (options.lowercase) password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  if (options.numbers) password += numberChars[Math.floor(Math.random() * numberChars.length)];
  if (options.symbols) password += symbolChars[Math.floor(Math.random() * symbolChars.length)];

  // Fill the rest of the password
  while (password.length < length) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function calculatePasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 5);
}