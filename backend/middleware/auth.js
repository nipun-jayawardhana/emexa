export const protect = (req, res, next) => {
  // Very small placeholder auth middleware.
  // Replace with real JWT/session logic.
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Not authorized' });

  // If header present, just allow through for now
  next();
};
