import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notifications = db.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications.' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = db.notifications.find((n) => n.id === id && n.user_id === req.user!.id);

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }

    notification.is_read = true;

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update notification.' });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    db.notifications
      .filter((n) => n.user_id === userId)
      .forEach((n) => (n.is_read = true));

    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to mark notifications as read.' });
  }
};
