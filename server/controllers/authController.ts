import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { generateToken } from '../utils/token.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      phone,
      gender,
      date_of_birth,
      // Doctor-specific
      specialization,
      qualification,
      experience,
      license_number,
      hospital,
      // Patient-specific
      blood_group,
      allergies,
      existing_conditions,
      address,
      emergency_contact,
    } = req.body;

    if (!full_name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Full name, email, password, and role are required.' });
      return;
    }

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.users.find((u) => u.email === normalizedEmail);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userId = db.generateUUID();
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      full_name,
      email: normalizedEmail,
      password_hash,
      role,
      phone: phone || '',
      gender: gender || 'other',
      date_of_birth: date_of_birth || '',
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    db.users.push(newUser);

    if (role === 'patient') {
      db.patient_profiles.push({
        id: db.generateUUID(),
        user_id: userId,
        blood_group: blood_group || '',
        allergies: allergies || '',
        existing_conditions: existing_conditions || '',
        address: address || '',
        emergency_contact: emergency_contact || '',
        profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
        created_at: now,
        updated_at: now,
      });
    } else if (role === 'doctor') {
      db.doctor_profiles.push({
        id: db.generateUUID(),
        user_id: userId,
        specialization: specialization || 'General Practitioner',
        qualification: qualification || 'MD / MBBS',
        experience: Number(experience) || 1,
        license_number: license_number || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
        hospital: hospital || 'General Medical Hospital',
        address: address || '',
        profile_image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
        created_at: now,
        updated_at: now,
      });
    }

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    // Sanitize user object (never return password_hash)
    const { password_hash: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email === normalizedEmail);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ success: false, message: 'Account is deactivated. Contact an administrator.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    let profile = null;
    if (user.role === 'patient') {
      profile = db.patient_profiles.find((p) => p.user_id === user.id);
    } else if (user.role === 'doctor') {
      profile = db.doctor_profiles.find((d) => d.user_id === user.id);
    }

    const { password_hash: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        ...safeUser,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let profile = null;
    if (req.user.role === 'patient') {
      profile = db.patient_profiles.find((p) => p.user_id === req.user!.id);
    } else if (req.user.role === 'doctor') {
      profile = db.doctor_profiles.find((d) => d.user_id === req.user!.id);
    }

    const { password_hash: _, ...safeUser } = req.user;

    res.json({
      success: true,
      user: {
        ...safeUser,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch user.' });
  }
};
