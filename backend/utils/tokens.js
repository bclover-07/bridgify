import jwt from 'jsonwebtoken';

export function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

export function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
}

export function setTokenCookies(res, userId) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });

  return { accessToken, refreshToken };
}

export function clearTokenCookies(res) {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth' });
}

export function generateShareToken(studentId, expiresInHours = 72) {
  return jwt.sign(
    { studentId, purpose: 'wallet_share' },
    process.env.WALLET_SHARE_SECRET,
    { expiresIn: `${expiresInHours}h` }
  );
}

export function verifyShareToken(token) {
  return jwt.verify(token, process.env.WALLET_SHARE_SECRET);
}
