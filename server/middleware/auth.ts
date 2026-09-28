import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token.js';
import { db, User } from '../config/db.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  tokenPayload?: TokenPayload;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ success: false, message: 'Invalid or expired token. Please sign in again.' });
    return;
  }

  const user = db.users.find((u) => u.id === decoded.id && u.is_active);
  if (!user) {
    res.status(401).json({ success: false, message: 'User account not found or deactivated.' });
    return;
  }

  req.user = user;
  req.tokenPayload = decoded;
  next();
};
