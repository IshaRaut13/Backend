export const authRole = (role) => {
  return (req, res, next) => {
      if (!req.user || req.user.role !== role) {
          return res.status(403).json({ success: false, message: "Forbidden: Insufficient Permissions" });
      }
      next();
  };
};
