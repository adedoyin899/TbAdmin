import { hashPassword, comparePassword, generateToken, verifyToken } from '../services/authService.js';
import type { JWTPayload } from '../types/auth.js';

async function runAuthVerification() {
  console.log('🧪 Starting Auth System Verification...\n');

  // Test 1: Password hashing and comparison
  console.log('Test 1: Bcrypt Password Hashing & Verification');
  const password = 'temp_password_123';
  const hash = await hashPassword(password);
  console.log('Generated hash:', hash.slice(0, 20) + '...');
  const isMatch = await comparePassword(password, hash);
  const isWrong = await comparePassword('wrong_password', hash);
  if (isMatch && !isWrong) {
    console.log('✅ Password hashing & comparison passed.');
  } else {
    throw new Error('Password comparison failed!');
  }

  // Test 2: JWT token generation and verification
  console.log('\nTest 2: JWT Generation & Verification');
  const payload: JWTPayload = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'maz@talentbridge.cv',
    role: 'admin',
  };
  const token = generateToken(payload);
  console.log('Generated JWT token:', token.slice(0, 30) + '...');
  const decoded = verifyToken(token);
  if (decoded && decoded.email === payload.email && decoded.role === 'admin') {
    console.log('✅ JWT generation and verification passed with valid 7d payload.');
  } else {
    throw new Error('JWT verification failed!');
  }

  // Test 3: Invalid token rejection
  console.log('\nTest 3: Invalid Token Rejection');
  const invalidDecoded = verifyToken('invalid.jwt.token');
  if (invalidDecoded === null) {
    console.log('✅ Invalid token correctly returned null.');
  } else {
    throw new Error('Invalid token was not rejected!');
  }

  console.log('\n🎉 ALL AUTH SYSTEM TESTS PASSED SUCCESSFULLY!');
}

runAuthVerification().catch((err) => {
  console.error('❌ Auth tests failed:', err);
  process.exit(1);
});
