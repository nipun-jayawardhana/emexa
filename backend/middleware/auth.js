export const protect = (req, res, next) => {
  // Very small placeholder auth middleware.
  // In production you should replace this with real JWT/session logic.
  const auth = req.headers.authorization;

  // Allow bypass in development when explicitly enabled
  const allowBypass = process.env.NODE_ENV !== 'production' && (process.env.ALLOW_DEV_AUTH_BYPASS ?? 'true') === 'true';
  if (!auth) {
    if (allowBypass) return next();
    return res.status(401).json({ message: 'Not authorized' });
  }

  // If header present, just allow through for now
  next();
};
