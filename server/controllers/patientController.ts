import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ProgressService } from '../services/progressService.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = db.patient_profiles.find((p) => p.user_id === userId);
    const { password_hash: _, ...safeUser } = req.user!;

    res.json({
      success: true,
      data: {
        user: safeUser,
        profile: profile || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch patient profile.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      full_name,
      phone,
      gender,
      date_of_birth,
      blood_group,
      allergies,
      existing_conditions,
      address,
      emergency_contact,
      profile_image,
    } = req.body;

    // Update user info
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      if (full_name) user.full_name = full_name;
      if (phone !== undefined) user.phone = phone;
      if (gender) user.gender = gender;
      if (date_of_birth) user.date_of_birth = date_of_birth;
      user.updated_at = new Date().toISOString();
    }

    // Update or create patient profile
    let profile = db.patient_profiles.find((p) => p.user_id === userId);
    const now = new Date().toISOString();

    if (!profile) {
      profile = {
        id: db.generateUUID(),
        user_id: userId,
        blood_group: blood_group || '',
        allergies: allergies || '',
        existing_conditions: existing_conditions || '',
        address: address || '',
        emergency_contact: emergency_contact || '',
        profile_image: profile_image || '',
        created_at: now,
        updated_at: now,
      };
      db.patient_profiles.push(profile);
    } else {
      if (blood_group !== undefined) profile.blood_group = blood_group;
      if (allergies !== undefined) profile.allergies = allergies;
      if (existing_conditions !== undefined) profile.existing_conditions = existing_conditions;
      if (address !== undefined) profile.address = address;
      if (emergency_contact !== undefined) profile.emergency_contact = emergency_contact;
      if (profile_image !== undefined) profile.profile_image = profile_image;
      profile.updated_at = now;
    }

    const { password_hash: _, ...safeUser } = user!;

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: safeUser,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update patient profile.' });
  }
};

export const getDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user!.id;

    // Appointments
    const patientAppointments = db.appointments
      .filter((a) => a.patient_id === patientId)
      .map((a) => {
        const doctor = db.users.find((u) => u.id === a.doctor_id);
        const doctorProf = db.doctor_profiles.find((dp) => dp.user_id === a.doctor_id);
        return {
          ...a,
          doctor_name: doctor?.full_name || 'Dr. Specialist',
          doctor_specialization: doctorProf?.specialization || 'Consultant',
        };
      })
      .sort((a, b) => new Date(`${b.appointment_date} ${b.appointment_time}`).getTime() - new Date(`${a.appointment_date} ${a.appointment_time}`).getTime());

    const upcomingAppointments = patientAppointments.filter(
      (a) => a.status === 'confirmed' || a.status === 'pending'
    );
    const pastAppointments = patientAppointments.filter(
      (a) => a.status === 'completed' || a.status === 'cancelled'
    );

    // Prescriptions with item details and doctor name
    const prescriptions = db.prescriptions
      .filter((p) => p.patient_id === patientId)
      .map((p) => {
        const items = db.prescription_items.filter((pi) => pi.prescription_id === p.id);
        const doctor = db.users.find((u) => u.id === p.doctor_id);
        return {
          ...p,
          doctor_name: doctor?.full_name || 'Dr. Attending',
          items,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Medical Records
    const medicalRecords = db.medical_records
      .filter((mr) => mr.patient_id === patientId)
      .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime());

    // Health Progress Overview & Summary
    const progressComparison = ProgressService.compareProgress(patientId);
    const allProgressRecords = ProgressService.getPatientProgressRecords(patientId);

    // Recent Doctor Review / Consultation
    const consultations = db.consultations
      .filter((c) => c.patient_id === patientId)
      .map((c) => {
        const doctor = db.users.find((u) => u.id === c.doctor_id);
        return {
          ...c,
          doctor_name: doctor?.full_name || 'Doctor',
        };
      })
      .sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime());

    const latestConsultation = consultations[0] || null;

    // Next follow-up date (from either latest progress record or latest consultation)
    const nextFollowUp =
      progressComparison.latestRecord?.follow_up_date || latestConsultation?.follow_up_date || null;

    // Unread notifications
    const notifications = db.notifications
      .filter((n) => n.user_id === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: {
        patient_name: req.user!.full_name,
        upcomingAppointments,
        pastAppointments,
        currentPrescriptions: prescriptions,
        recentMedicalRecords: medicalRecords.slice(0, 5),
        latestConsultation,
        healthProgress: {
          totalReviews: allProgressRecords.length,
          latestRecord: progressComparison.latestRecord,
          previousRecord: progressComparison.previousRecord,
          comparisons: progressComparison.comparisons,
          currentStatus: progressComparison.latestRecord?.progress_status || 'No reviews yet',
          nextFollowUp,
        },
        notifications: notifications.slice(0, 5),
        unreadNotificationsCount: notifications.filter((n) => !n.is_read).length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard.' });
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id || req.user!.id;

    // Check authorization: Patients can only view their own history unless doctor/admin
    if (req.user!.role === 'patient' && req.user!.id !== patientId) {
      res.status(403).json({ success: false, message: 'Forbidden. You cannot view another patient history.' });
      return;
    }

    const patient = db.users.find((u) => u.id === patientId);
    const profile = db.patient_profiles.find((p) => p.user_id === patientId);

    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }

    const consultations = db.consultations
      .filter((c) => c.patient_id === patientId)
      .map((c) => {
        const doctor = db.users.find((u) => u.id === c.doctor_id);
        const doctorProfile = db.doctor_profiles.find((dp) => dp.user_id === c.doctor_id);
        const prescription = db.prescriptions.find((p) => p.consultation_id === c.id);
        const prescriptionItems = prescription
          ? db.prescription_items.filter((pi) => pi.prescription_id === prescription.id)
          : [];

        return {
          ...c,
          doctor_name: doctor?.full_name || 'Dr. Specialist',
          doctor_specialization: doctorProfile?.specialization || 'Practitioner',
          prescription: prescription ? { ...prescription, items: prescriptionItems } : null,
        };
      })
      .sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime());

    const progressRecords = ProgressService.getPatientProgressRecords(patientId)
      .map((r) => {
        const doctor = db.users.find((u) => u.id === r.doctor_id);
        return {
          ...r,
          doctor_name: doctor?.full_name || 'Doctor',
        };
      })
      .reverse(); // Newest first

    const medicalRecords = db.medical_records
      .filter((m) => m.patient_id === patientId)
      .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime());

    res.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          full_name: patient.full_name,
          email: patient.email,
          phone: patient.phone,
          gender: patient.gender,
          date_of_birth: patient.date_of_birth,
          profile,
        },
        consultations,
        progressRecords,
        medicalRecords,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch medical history.' });
  }
};
