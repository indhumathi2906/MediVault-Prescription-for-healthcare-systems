import { Response } from 'express';
import { db, Prescription, PrescriptionItem } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createPrescription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { consultation_id, patient_id, diagnosis, instructions, items } = req.body;
    const doctor_id = req.user!.id;

    if (!patient_id) {
      res.status(400).json({ success: false, message: 'Patient ID is required.' });
      return;
    }

    const prescriptionId = db.generateUUID();
    const newPrescription: Prescription = {
      id: prescriptionId,
      consultation_id: consultation_id || undefined,
      patient_id,
      doctor_id,
      diagnosis: diagnosis || '',
      instructions: instructions || '',
      created_at: new Date().toISOString(),
    };

    db.prescriptions.push(newPrescription);

    const insertedItems: PrescriptionItem[] = [];
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const pItem: PrescriptionItem = {
          id: db.generateUUID(),
          prescription_id: prescriptionId,
          medicine_name: item.medicine_name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions || '',
        };
        db.prescription_items.push(pItem);
        insertedItems.push(pItem);
      }
    }

    // Send notification to patient
    const doctorUser = db.users.find((u) => u.id === doctor_id);
    db.notifications.push({
      id: db.generateUUID(),
      user_id: patient_id,
      title: 'Digital Prescription Issued',
      message: `${doctorUser?.full_name || 'Your doctor'} has issued a digital prescription for you.`,
      type: 'prescription_created',
      is_read: false,
      link: '/patient/prescriptions',
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Prescription generated successfully.',
      data: {
        ...newPrescription,
        items: insertedItems,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create prescription.' });
  }
};

export const getPrescriptionsByPatient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    if (req.user!.role === 'patient' && req.user!.id !== patientId) {
      res.status(403).json({ success: false, message: 'Unauthorized to access another patient prescriptions.' });
      return;
    }

    const prescriptions = db.prescriptions
      .filter((p) => p.patient_id === patientId)
      .map((p) => {
        const doctor = db.users.find((u) => u.id === p.doctor_id);
        const doctorProfile = db.doctor_profiles.find((dp) => dp.user_id === p.doctor_id);
        const items = db.prescription_items.filter((pi) => pi.prescription_id === p.id);

        return {
          ...p,
          doctor_name: doctor?.full_name || 'Dr. Practitioner',
          doctor_specialization: doctorProfile?.specialization || 'Consultant',
          doctor_hospital: doctorProfile?.hospital || '',
          doctor_license: doctorProfile?.license_number || '',
          items,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: prescriptions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch prescriptions.' });
  }
};

export const getPrescriptionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const prescription = db.prescriptions.find((p) => p.id === id);

    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found.' });
      return;
    }

    const doctor = db.users.find((u) => u.id === prescription.doctor_id);
    const doctorProfile = db.doctor_profiles.find((dp) => dp.user_id === prescription.doctor_id);
    const patient = db.users.find((u) => u.id === prescription.patient_id);
    const patientProfile = db.patient_profiles.find((pp) => pp.user_id === prescription.patient_id);
    const items = db.prescription_items.filter((pi) => pi.prescription_id === prescription.id);
    const consultation = prescription.consultation_id
      ? db.consultations.find((c) => c.id === prescription.consultation_id)
      : null;

    res.json({
      success: true,
      data: {
        ...prescription,
        items,
        doctor: {
          name: doctor?.full_name,
          specialization: doctorProfile?.specialization,
          qualification: doctorProfile?.qualification,
          license_number: doctorProfile?.license_number,
          hospital: doctorProfile?.hospital,
          address: doctorProfile?.address,
          phone: doctor?.phone,
        },
        patient: {
          name: patient?.full_name,
          gender: patient?.gender,
          date_of_birth: patient?.date_of_birth,
          phone: patient?.phone,
          blood_group: patientProfile?.blood_group,
          allergies: patientProfile?.allergies,
          address: patientProfile?.address,
        },
        follow_up_date: consultation?.follow_up_date || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch prescription.' });
  }
};
