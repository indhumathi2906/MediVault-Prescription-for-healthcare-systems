import { Response } from 'express';
import { db, Consultation } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createConsultation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      appointment_id,
      patient_id,
      symptoms,
      observations,
      diagnosis,
      doctor_notes,
      follow_up_date,
    } = req.body;

    const doctor_id = req.user!.id;

    if (!patient_id || !diagnosis) {
      res.status(400).json({ success: false, message: 'Patient ID and diagnosis are required.' });
      return;
    }

    const newConsultation: Consultation = {
      id: db.generateUUID(),
      appointment_id: appointment_id || undefined,
      patient_id,
      doctor_id,
      consultation_date: new Date().toISOString(),
      symptoms: symptoms || '',
      observations: observations || '',
      diagnosis,
      doctor_notes: doctor_notes || '',
      follow_up_date: follow_up_date || undefined,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Append to consultations (Never overwrite)
    db.consultations.push(newConsultation);

    // If linked to an appointment, mark appointment as completed
    if (appointment_id) {
      const appt = db.appointments.find((a) => a.id === appointment_id);
      if (appt) {
        appt.status = 'completed';
        appt.updated_at = new Date().toISOString();
      }
    }

    // Send notification to patient
    const doctorUser = db.users.find((u) => u.id === doctor_id);
    db.notifications.push({
      id: db.generateUUID(),
      user_id: patient_id,
      title: 'Consultation Completed',
      message: `${doctorUser?.full_name || 'Your doctor'} has completed your clinical consultation and updated your record.`,
      type: 'review_completed',
      is_read: false,
      link: '/patient/medical-history',
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Consultation recorded successfully.',
      data: newConsultation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create consultation.' });
  }
};

export const getConsultationsByPatient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    // Authorization check
    if (req.user!.role === 'patient' && req.user!.id !== patientId) {
      res.status(403).json({ success: false, message: 'Unauthorized to view another patient consultations.' });
      return;
    }

    const consultations = db.consultations
      .filter((c) => c.patient_id === patientId)
      .map((c) => {
        const doctor = db.users.find((u) => u.id === c.doctor_id);
        const doctorProf = db.doctor_profiles.find((dp) => dp.user_id === c.doctor_id);
        const prescription = db.prescriptions.find((p) => p.consultation_id === c.id);
        const prescriptionItems = prescription
          ? db.prescription_items.filter((pi) => pi.prescription_id === prescription.id)
          : [];

        return {
          ...c,
          doctor_name: doctor?.full_name || 'Dr. Specialist',
          doctor_specialization: doctorProf?.specialization || 'Consultant',
          prescription: prescription ? { ...prescription, items: prescriptionItems } : null,
        };
      })
      .sort((a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime());

    res.json({
      success: true,
      data: consultations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch consultations.' });
  }
};

export const getConsultationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const consultation = db.consultations.find((c) => c.id === id);

    if (!consultation) {
      res.status(404).json({ success: false, message: 'Consultation not found.' });
      return;
    }

    const doctor = db.users.find((u) => u.id === consultation.doctor_id);
    const doctorProfile = db.doctor_profiles.find((dp) => dp.user_id === consultation.doctor_id);
    const patient = db.users.find((u) => u.id === consultation.patient_id);
    const patientProfile = db.patient_profiles.find((pp) => pp.user_id === consultation.patient_id);

    const prescription = db.prescriptions.find((p) => p.consultation_id === consultation.id);
    const prescriptionItems = prescription
      ? db.prescription_items.filter((pi) => pi.prescription_id === prescription.id)
      : [];

    res.json({
      success: true,
      data: {
        ...consultation,
        doctor_name: doctor?.full_name,
        doctor_specialization: doctorProfile?.specialization,
        doctor_qualification: doctorProfile?.qualification,
        doctor_hospital: doctorProfile?.hospital,
        patient_name: patient?.full_name,
        patient_phone: patient?.phone,
        patient_gender: patient?.gender,
        patient_dob: patient?.date_of_birth,
        patient_blood_group: patientProfile?.blood_group,
        prescription: prescription ? { ...prescription, items: prescriptionItems } : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch consultation details.' });
  }
};
