import { Response } from 'express';
import { db, Appointment } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { doctor_id, appointment_date, appointment_time, reason, notes } = req.body;
    const patient_id = req.user!.role === 'patient' ? req.user!.id : req.body.patient_id;

    if (!doctor_id || !appointment_date || !appointment_time) {
      res.status(400).json({ success: false, message: 'Doctor ID, appointment date, and time are required.' });
      return;
    }

    // Verify doctor exists
    const doctor = db.users.find((u) => u.id === doctor_id && u.role === 'doctor');
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Selected doctor not found.' });
      return;
    }

    // Double-booking check: prevent booking the same doctor on the same date and time if status is not cancelled
    const conflictingAppointment = db.appointments.find(
      (a) =>
        a.doctor_id === doctor_id &&
        a.appointment_date === appointment_date &&
        a.appointment_time === appointment_time &&
        a.status !== 'cancelled'
    );

    if (conflictingAppointment) {
      res.status(409).json({
        success: false,
        message: 'This doctor already has an appointment scheduled at this exact date and time. Please select another slot.',
      });
      return;
    }

    const newAppointment: Appointment = {
      id: db.generateUUID(),
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      status: 'pending',
      reason: reason || '',
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.appointments.push(newAppointment);

    // Create notification for Doctor
    const patientUser = db.users.find((u) => u.id === patient_id);
    db.notifications.push({
      id: db.generateUUID(),
      user_id: doctor_id,
      title: 'New Appointment Booking',
      message: `${patientUser?.full_name || 'A patient'} requested an appointment on ${appointment_date} at ${appointment_time}.`,
      type: 'appointment_booked',
      is_read: false,
      link: '/doctor/appointments',
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: newAppointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to book appointment.' });
  }
};

export const getAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let filteredAppointments: Appointment[] = [];

    if (user.role === 'patient') {
      filteredAppointments = db.appointments.filter((a) => a.patient_id === user.id);
    } else if (user.role === 'doctor') {
      filteredAppointments = db.appointments.filter((a) => a.doctor_id === user.id);
    } else if (user.role === 'admin') {
      filteredAppointments = [...db.appointments];
    }

    // Enrich with doctor and patient details
    const enriched = filteredAppointments.map((a) => {
      const patient = db.users.find((u) => u.id === a.patient_id);
      const doctor = db.users.find((u) => u.id === a.doctor_id);
      const doctorProfile = db.doctor_profiles.find((dp) => dp.user_id === a.doctor_id);

      return {
        ...a,
        patient_name: patient?.full_name || 'Patient',
        patient_email: patient?.email || '',
        patient_phone: patient?.phone || '',
        doctor_name: doctor?.full_name || 'Doctor',
        doctor_specialization: doctorProfile?.specialization || 'Consultant',
        doctor_hospital: doctorProfile?.hospital || '',
      };
    }).sort((a, b) => new Date(`${b.appointment_date} ${b.appointment_time}`).getTime() - new Date(`${a.appointment_date} ${a.appointment_time}`).getTime());

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch appointments.' });
  }
};

export const getAppointmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = db.appointments.find((a) => a.id === id);

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    const patient = db.users.find((u) => u.id === appointment.patient_id);
    const doctor = db.users.find((u) => u.id === appointment.doctor_id);
    const doctorProfile = db.doctor_profiles.find((dp) => dp.user_id === appointment.doctor_id);
    const patientProfile = db.patient_profiles.find((pp) => pp.user_id === appointment.patient_id);

    res.json({
      success: true,
      data: {
        ...appointment,
        patient_name: patient?.full_name,
        patient_email: patient?.email,
        patient_phone: patient?.phone,
        patient_profile: patientProfile,
        doctor_name: doctor?.full_name,
        doctor_specialization: doctorProfile?.specialization,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch appointment.' });
  }
};

export const updateAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes, appointment_date, appointment_time } = req.body;

    const appointment = db.appointments.find((a) => a.id === id);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    if (status) {
      appointment.status = status;

      // Send notification to patient if status changed
      if (status === 'confirmed') {
        db.notifications.push({
          id: db.generateUUID(),
          user_id: appointment.patient_id,
          title: 'Appointment Confirmed',
          message: `Your appointment for ${appointment.appointment_date} at ${appointment.appointment_time} has been confirmed.`,
          type: 'appointment_confirmed',
          is_read: false,
          link: '/patient/appointments',
          created_at: new Date().toISOString(),
        });
      } else if (status === 'cancelled') {
        const notifyTarget = req.user!.role === 'patient' ? appointment.doctor_id : appointment.patient_id;
        db.notifications.push({
          id: db.generateUUID(),
          user_id: notifyTarget,
          title: 'Appointment Cancelled',
          message: `The appointment for ${appointment.appointment_date} has been cancelled.`,
          type: 'appointment_cancelled',
          is_read: false,
          link: req.user!.role === 'patient' ? '/doctor/appointments' : '/patient/appointments',
          created_at: new Date().toISOString(),
        });
      }
    }

    if (notes !== undefined) appointment.notes = notes;
    if (appointment_date) appointment.appointment_date = appointment_date;
    if (appointment_time) appointment.appointment_time = appointment_time;
    appointment.updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'Appointment updated successfully.',
      data: appointment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update appointment.' });
  }
};

export const deleteAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const index = db.appointments.findIndex((a) => a.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    // Soft cancel instead of permanent delete if historical
    db.appointments[index].status = 'cancelled';
    db.appointments[index].updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'Appointment marked as cancelled.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to cancel appointment.' });
  }
};
