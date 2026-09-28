import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalPatients = db.users.filter((u) => u.role === 'patient').length;
    const totalDoctors = db.users.filter((u) => u.role === 'doctor').length;
    const totalAppointments = db.appointments.length;
    const totalConsultations = db.consultations.length;
    const totalProgressReviews = db.progress_records.length;
    const activeUsers = db.users.filter((u) => u.is_active).length;

    // Recent system activities
    const recentActivities = [
      ...db.progress_records.map((p) => ({
        id: p.id,
        type: 'Progress Review',
        description: `Progress assessment logged (Status: ${p.progress_status})`,
        timestamp: p.created_at,
      })),
      ...db.appointments.map((a) => ({
        id: a.id,
        type: 'Appointment',
        description: `Appointment scheduled for ${a.appointment_date} (${a.status})`,
        timestamp: a.created_at,
      })),
      ...db.consultations.map((c) => ({
        id: c.id,
        type: 'Consultation',
        description: `Clinical consultation completed for diagnosis: ${c.diagnosis}`,
        timestamp: c.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          totalConsultations,
          totalProgressReviews,
          activeUsers,
        },
        recentActivities,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch admin dashboard.' });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.query;

    let users = db.users.map((u) => {
      const { password_hash: _, ...safeUser } = u;
      const patientProfile = db.patient_profiles.find((p) => p.user_id === u.id);
      const doctorProfile = db.doctor_profiles.find((d) => d.user_id === u.id);

      return {
        ...safeUser,
        profile: patientProfile || doctorProfile || null,
      };
    });

    if (role) {
      users = users.filter((u) => u.role === role);
    }

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch users.' });
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = db.users.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.id === req.user!.id) {
      res.status(400).json({ success: false, message: 'Administrators cannot deactivate their own account.' });
      return;
    }

    user.is_active = Boolean(is_active);
    user.updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: `User account has been ${user.is_active ? 'activated' : 'deactivated'}.`,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_active: user.is_active,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update user status.' });
  }
};
