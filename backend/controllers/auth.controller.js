import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Institution from '../models/Institution.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import { setTokenCookies, clearTokenCookies } from '../utils/tokens.js';
import { getSkill } from '../utils/skillTaxonomy.js';
import { embedText, composeSEGEmbeddingText } from '../utils/embeddings.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, institutionCode, student, faculty, recruiter } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (!['student', 'faculty', 'admin', 'recruiter'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    let institutionId = null;
    if (role !== 'recruiter') {
      if (!institutionCode) {
        return res.status(400).json({ error: 'Institution code is required for non-recruiter roles' });
      }
      const institution = await Institution.findOne({ code: institutionCode.toUpperCase() });
      if (!institution) {
        return res.status(404).json({ error: 'Institution not found. Check your institution code.' });
      }
      institutionId = institution._id;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userData = {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      institutionId,
      isActive: true,
    };

    if (role === 'student' && student) {
      userData.student = student;
    }
    if (role === 'faculty' && faculty) {
      userData.faculty = faculty;
    }
    if (role === 'recruiter' && recruiter) {
      userData.recruiter = recruiter;
    }

    const user = await User.create(userData);
    setTokenCookies(res, user._id);

    const userResponse = await User.findById(user._id)
      .select('-passwordHash')
      .populate('institutionId', 'name code');

    res.status(201).json({
      user: userResponse,
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    setTokenCookies(res, user._id);

    const userResponse = await User.findById(user._id)
      .select('-passwordHash')
      .populate('institutionId', 'name code');

    res.json({
      user: userResponse,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    setTokenCookies(res, user._id);

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  clearTokenCookies(res);
  res.json({ message: 'Logged out successfully' });
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}

export async function onboard(req, res, next) {
  try {
    const userId = req.user._id;
    const { student, faculty, recruiter, selfDeclaredSkills } = req.body;

    const updateData = { onboarded: true };

    if (req.user.role === 'student') {
      if (student) {
        Object.keys(student).forEach((key) => {
          updateData[`student.${key}`] = student[key];
        });
      }

      if (selfDeclaredSkills && Array.isArray(selfDeclaredSkills)) {
        updateData['student.selfDeclaredSkills'] = selfDeclaredSkills;

        const segEntries = [];
        for (const skillId of selfDeclaredSkills) {
          const skillData = getSkill(skillId);
          if (!skillData) continue;

          const entry = {
            studentId: userId,
            institutionId: req.user.institutionId._id || req.user.institutionId,
            skillId: skillData.id,
            skillLabel: skillData.label,
            skillCategory: skillData.category,
            skillDomain: skillData.domain,
            nsqfLevel: skillData.nsqf,
            evidenceType: 'self_assessment',
            confidenceScore: 20,
            decayRate: 0.08,
            lastReinforced: new Date(),
            evidenceWeight: 0.2,
            verificationMethod: 'self_declared',
            evidenceMetadata: {
              source: 'onboarding',
              declaredAt: new Date().toISOString(),
            },
          };
          const embeddingText = composeSEGEmbeddingText(entry);
          entry.embedding = await embedText(embeddingText, userId);
          segEntries.push(entry);
        }

        if (segEntries.length > 0) {
          await SkillEvidenceGraph.insertMany(segEntries);
        }
      }
    }

    if (req.user.role === 'faculty' && faculty) {
      Object.keys(faculty).forEach((key) => {
        updateData[`faculty.${key}`] = faculty[key];
      });
    }

    if (req.user.role === 'recruiter' && recruiter) {
      Object.keys(recruiter).forEach((key) => {
        updateData[`recruiter.${key}`] = recruiter[key];
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-passwordHash')
      .populate('institutionId', 'name code');

    res.json({
      user: updatedUser,
      message: 'Onboarding complete',
    });
  } catch (error) {
    next(error);
  }
}

export async function validateInstitutionCode(req, res, next) {
  try {
    const { code } = req.params;
    const institution = await Institution.findOne({ code: code.toUpperCase() });

    if (!institution) {
      return res.status(404).json({ error: 'Institution not found', valid: false });
    }

    res.json({
      valid: true,
      institution: {
        name: institution.name,
        code: institution.code,
        departments: institution.departments.map((d) => ({ name: d.name, code: d.code })),
      },
    });
  } catch (error) {
    next(error);
  }
}
