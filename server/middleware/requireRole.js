module.exports = function(requiredRole) {
  return (req, res, next) => {
    const role = req.headers['x-user-role'];
    if (!role) {
      return res.status(401).json({ success: false, message: 'Missing role header' });
    }
    if (role !== requiredRole) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    req.user = { role };
    next();
  };
};
