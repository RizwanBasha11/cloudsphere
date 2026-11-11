import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cloudsphere_enterprise_jwt_secret_key_2026_xyz987');
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found for this token session.' });
      }
      if (user.password) delete user.password;

      req.user = user;
      req.tenantId = user.tenantId;
      return next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Invalid, expired, or malformed authentication token.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden. Administrator privileges required.' });
};
