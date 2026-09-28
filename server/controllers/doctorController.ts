import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ProgressService } from '../services/progressService.js';

export const getDoctors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, specialization } = req.query;

    let doctors = db.users
      .filter((u) => u.role === 'doctor' && u.is_active)
      .map((u) => {
        const profile = db.doctor_profiles.find((dp) => dp.user_id === u.id);
        const { password_hash: _, ...safeUser } = u;
        return {
          ...safeUser,
          profile: profile || null,
        };
      });

    if (search) {
      const q = String(search).toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.full_name.toLowerCase().includes(q) ||
          d.profile?.specialization.toLowerCase().includes(q) ||
          d.profile?.hospital?.toLowerCase().includes(q)
      );
    }

    if (specialization) {
      const spec = String(specialization).toLowerCase();
      doctors = doctors.filter((d) => d.profile?.specialization.toLowerCase().includes(spec));
    }

    res.json({
      success: true,
      data: doctors,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctors.' });
  }
};

export const getDoctorById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = db.users.find((u) => u.id === id && u.role === 'doctor');

    if (!user) {
      res.status(404).json({ success: false, message: 'Doctor not found.' });
      return;
    }

    const profile = db.doctor_profiles.find((dp) => dp.user_id === id);
    const { password_hash: _, ...safeUser } = user;

    res.json({
      success: true,
      data: {
        ...safeUser,
        profile: profile || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor.' });
  }
};

export const getDoctorDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.id;
    const today = new Date().toISOString().split('T')[0];

    // Appointments for this doctor
    const doctorAppointments = db.appointments
      .filter((a) => a.doctor_id === doctorId)
      .map((a) => {
        const patient = db.users.find((u) => u.id === a.patient_id);
        const patientProfile = db.patient_profiles.find((pp) => pp.user_id === a.patient_id);
        return {
          ...a,
          patient_name: patient?.full_name || 'Patient',
          patient_phone: patient?.phone || '',
          patient_email: patient?.email || '',
          patient_blood_group: patientProfile?.blood_group || '',
        };
      })
      .sort((a, b) => new Date(`${a.appointment_date} ${a.appointment_time}`).getTime() - new Date(`${b.appointment_date} ${b.appointment_time}`).getTime());

    const todayAppointments = doctorAppointments.filter(
      (a) => a.appointment_date === today && a.status !== 'cancelled'
    );
    const upcomingAppointments = doctorAppointments.filter(
      (a) => (a.status === 'confirmed' || a.status === 'pending') && a.appointment_date >= today
    );

    // Consultations completed
    const completedConsultations = db.consultations.filter((c) => c.doctor_id === doctorId);

    // Unique Patients
    const patientIds = new Set<string>();
    doctorAppointments.forEach((a) => patientIds.add(a.patient_id));
    completedConsultations.forEach((c) => patientIds.add(c.patient_id));

    // Recent progress reviews conducted by this doctor
    const recentReviews = db.progress_records
      .filter((r) => r.doctor_id === doctorId)
      .sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime())
      .slice(0, 6)
      .map((r) => {
        const patient = db.users.find((u) => u.id === r.patient_id);
        return {
          ...r,
          patient_name: patient?.full_name || 'Patient',
        };
      });

    // Patient progress overview for patients treated by this doctor
    const patientsProgressOverview = Array.from(patientIds).map((pId) => {
      const patient = db.users.find((u) => u.id === pId);
      const comparison = ProgressService.compareProgress(pId);
      return {
        patient_id: pId,
        patient_name: patient?.full_name || 'Patient',
        latestRecord: comparison.latestRecord,
        status: comparison.latestRecord?.progress_status || 'Unassessed',
      };
    });

    res.json({
      success: true,
      data: {
        doctor_name: req.user!.full_name,
        stats: {
          todayAppointmentsCount: todayAppointments.length,
          upcomingAppointmentsCount: upcomingAppointments.length,
          completedConsultationsCount: completedConsultations.length,
          totalPatientsCount: patientIds.size,
        },
        todayAppointments,
        upcomingAppointments: upcomingAppointments.slice(0, 5),
        recentReviews,
        patientsProgressOverview,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor dashboard.' });
  }
};

export const getDoctorPatients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.id;

    // Get all patients who have interacted with this doctor, or all registered patients if requested
    const allPatients = db.users
      .filter((u) => u.role === 'patient')
      .map((u) => {
        const profile = db.patient_profiles.find((p) => p.user_id === u.id);
        const { password_hash: _, ...safeUser } = u;
        const records = ProgressService.getPatientProgressRecords(u.id);
        const latestRecord = records.length > 0 ? records[records.length - 1] : null;

        const appointments = db.appointments.filter((a) => a.patient_id === u.id && a.doctor_id === doctorId);

        return {
          ...safeUser,
          profile: profile || null,
          totalReviews: records.length,
          latestProgressStatus: latestRecord?.progress_status || 'None',
          lastReviewDate: latestRecord?.review_date || null,
          hasAppointmentWithDoctor: appointments.length > 0,
        };
      });

    res.json({
      success: true,
      data: allPatients,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch doctor patients.' });
  }
};
