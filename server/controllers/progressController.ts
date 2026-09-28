import { Response } from 'express';
import { db, ProgressRecord } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ProgressService } from '../services/progressService.js';

export const createProgressRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      patient_id,
      consultation_id,
      appointment_id,
      review_date,
      weight,
      height,
      heart_rate,
      systolic_bp,
      diastolic_bp,
      blood_sugar,
      temperature,
      oxygen_saturation,
      progress_status,
      symptoms_status,
      treatment_adherence,
      patient_reported_improvement,
      doctor_progress_notes,
      follow_up_date,
    } = req.body;

    const doctor_id = req.user!.id;

    if (!patient_id) {
      res.status(400).json({ success: false, message: 'Patient ID is required.' });
      return;
    }

    const validStatuses = ['Improving', 'Stable', 'Needs Attention', 'Worsening'];
    if (!progress_status || !validStatuses.includes(progress_status)) {
      res.status(400).json({
        success: false,
        message: 'Progress status must be one of: Improving, Stable, Needs Attention, Worsening.',
      });
      return;
    }

    // Auto-calculate BMI if weight and height provided
    const weightNum = weight ? parseFloat(weight) : undefined;
    const heightNum = height ? parseFloat(height) : undefined;
    const calculatedBMI = ProgressService.calculateBMI(weightNum, heightNum);

    // CRITICAL DATA RULE: ALWAYS insert a NEW progress record. NEVER mutate or overwrite previous records!
    const newProgressRecord: ProgressRecord = {
      id: db.generateUUID(),
      patient_id,
      doctor_id,
      consultation_id: consultation_id || undefined,
      appointment_id: appointment_id || undefined,
      review_date: review_date || new Date().toISOString(),
      weight: weightNum,
      height: heightNum,
      bmi: calculatedBMI,
      heart_rate: heart_rate ? parseInt(heart_rate) : undefined,
      systolic_bp: systolic_bp ? parseInt(systolic_bp) : undefined,
      diastolic_bp: diastolic_bp ? parseInt(diastolic_bp) : undefined,
      blood_sugar: blood_sugar ? parseFloat(blood_sugar) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      oxygen_saturation: oxygen_saturation ? parseFloat(oxygen_saturation) : undefined,
      progress_status,
      symptoms_status: symptoms_status || '',
      treatment_adherence: treatment_adherence || '',
      patient_reported_improvement: patient_reported_improvement || '',
      doctor_progress_notes: doctor_progress_notes || '',
      follow_up_date: follow_up_date || undefined,
      created_at: new Date().toISOString(),
    };

    db.progress_records.push(newProgressRecord);

    // Send notification to patient
    const doctorUser = db.users.find((u) => u.id === doctor_id);
    db.notifications.push({
      id: db.generateUUID(),
      user_id: patient_id,
      title: 'Health Progress Assessment Logged',
      message: `${doctorUser?.full_name || 'Your doctor'} added a new health progress review. Current status: ${progress_status}.`,
      type: 'review_completed',
      is_read: false,
      link: '/patient/progress',
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Patient health progress review saved successfully. Historical integrity preserved.',
      data: newProgressRecord,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to record progress.' });
  }
};

export const getPatientProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    if (req.user!.role === 'patient' && req.user!.id !== patientId) {
      res.status(403).json({ success: false, message: 'Unauthorized to access another patient progress.' });
      return;
    }

    const records = db.progress_records
      .filter((r) => r.patient_id === patientId)
      .map((r) => {
        const doctor = db.users.find((u) => u.id === r.doctor_id);
        const doctorProfile = db.doctor_profiles.find((dp) => dp.user_id === r.doctor_id);

        return {
          ...r,
          doctor_name: doctor?.full_name || 'Dr. Attending',
          doctor_specialization: doctorProfile?.specialization || 'Clinical Specialist',
        };
      })
      .sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime()); // Newest first for timeline

    res.json({
      success: true,
      data: records,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch progress records.' });
  }
};

export const getPatientProgressSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    if (req.user!.role === 'patient' && req.user!.id !== patientId) {
      res.status(403).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { latestRecord, previousRecord, comparisons } = ProgressService.compareProgress(patientId);
    const allRecords = ProgressService.getPatientProgressRecords(patientId);

    const latestDoctor = latestRecord
      ? db.users.find((u) => u.id === latestRecord.doctor_id)
      : null;

    res.json({
      success: true,
      data: {
        totalReviews: allRecords.length,
        latestReviewDate: latestRecord?.review_date || null,
        currentStatus: latestRecord?.progress_status || 'No reviews recorded yet',
        nextFollowUp: latestRecord?.follow_up_date || null,
        latestDoctorName: latestDoctor?.full_name || null,
        latestRecord,
        previousRecord,
        comparisons,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate progress summary.' });
  }
};

export const getPatientProgressMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    if (req.user!.role === 'patient' && req.user!.id !== patientId) {
      res.status(403).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const chartMetrics = ProgressService.getChartMetrics(patientId);

    res.json({
      success: true,
      data: chartMetrics,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch chart metrics.' });
  }
};

export const getProgressRecordById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const record = db.progress_records.find((r) => r.id === id);

    if (!record) {
      res.status(404).json({ success: false, message: 'Progress record not found.' });
      return;
    }

    const doctor = db.users.find((u) => u.id === record.doctor_id);
    const patient = db.users.find((u) => u.id === record.patient_id);

    res.json({
      success: true,
      data: {
        ...record,
        doctor_name: doctor?.full_name,
        patient_name: patient?.full_name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch progress record.' });
  }
};
