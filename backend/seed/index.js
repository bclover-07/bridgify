import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

import Institution from '../models/Institution.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import SkillEvidenceGraph from '../models/SkillEvidenceGraph.js';
import Notification from '../models/Notification.js';

import institutionsSeed from './institutions.seed.js';
import usersSeed from './users.seed.js';
import coursesSeed from './courses.seed.js';
import { getSkill } from '../utils/skillTaxonomy.js';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await Promise.all([
      Institution.deleteMany({}),
      User.deleteMany({}),
      Course.deleteMany({}),
      Attendance.deleteMany({}),
      SkillEvidenceGraph.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Existing data cleared');

    console.log('Seeding institutions...');
    const createdInstitutions = await Institution.insertMany(institutionsSeed);
    const mrdu = createdInstitutions[0];
    console.log(`  Created institution: ${mrdu.name} (${mrdu.code})`);

    console.log('Seeding users...');
    const createdUsers = [];
    for (const userData of usersSeed) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        institutionId: userData.role !== 'recruiter' ? mrdu._id : null,
        isActive: true,
        onboarded: userData.onboarded || false,
        student: userData.student || undefined,
        faculty: userData.faculty || undefined,
        recruiter: userData.recruiter || undefined,
      });
      createdUsers.push(user);
      console.log(`  Created ${user.role}: ${user.name} (${user.email})`);
    }

    const students = createdUsers.filter((u) => u.role === 'student');
    const faculty = createdUsers.find((u) => u.role === 'faculty');

    console.log('Seeding courses...');
    const createdCourses = [];
    for (const courseData of coursesSeed) {
      const course = await Course.create({
        ...courseData,
        institutionId: mrdu._id,
        facultyId: faculty._id,
        enrolledStudentIds: students.map((s) => s._id),
      });
      createdCourses.push(course);
      console.log(`  Created course: ${course.code} - ${course.title}`);
    }

    if (faculty) {
      await User.findByIdAndUpdate(faculty._id, {
        'faculty.courses': createdCourses.map((c) => c._id),
      });
    }

    console.log('Seeding attendance records...');
    const attendanceRecords = [];
    const today = new Date();
    for (const student of students) {
      for (const course of createdCourses) {
        const isHighRisk = student.student.cgpa < 5.5;
        const isMediumRisk = student.student.cgpa >= 5.5 && student.student.cgpa < 7.0;

        for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
          const date = new Date(today);
          date.setDate(date.getDate() - dayOffset);

          if (date.getDay() === 0 || date.getDay() === 6) continue;

          let presentProbability;
          if (isHighRisk) {
            presentProbability = dayOffset < 30 ? 0.4 : 0.6;
          } else if (isMediumRisk) {
            presentProbability = dayOffset < 30 ? 0.65 : 0.75;
          } else {
            presentProbability = dayOffset < 30 ? 0.85 : 0.9;
          }

          attendanceRecords.push({
            studentId: student._id,
            courseId: course._id,
            date,
            isPresent: Math.random() < presentProbability,
            markedBy: faculty._id,
          });
        }
      }
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(`  Created ${attendanceRecords.length} attendance records`);

    console.log('Seeding initial SEG entries (self-assessment)...');
    let segCount = 0;
    for (const student of students) {
      const declaredSkills = student.student?.selfDeclaredSkills || [];
      for (const skillId of declaredSkills) {
        const skillData = getSkill(skillId);
        if (!skillData) continue;

        await SkillEvidenceGraph.create({
          studentId: student._id,
          institutionId: mrdu._id,
          skillId: skillData.id,
          skillLabel: skillData.label,
          skillCategory: skillData.category,
          skillDomain: skillData.domain,
          nsqfLevel: skillData.nsqf,
          evidenceType: 'self_assessment',
          confidenceScore: Math.floor(Math.random() * 25) + 15,
          decayRate: 0.08,
          lastReinforced: new Date(),
          evidenceWeight: 0.2,
          verificationMethod: 'self_declared',
          evidenceMetadata: {
            source: 'onboarding',
            declaredAt: new Date().toISOString(),
          },
          embedding: [],
        });
        segCount++;
      }
    }
    console.log(`  Created ${segCount} self-assessment SEG entries`);

    console.log('Seeding welcome notifications...');
    for (const user of createdUsers) {
      await Notification.create({
        userId: user._id,
        type: 'system',
        title: 'Welcome to Bridgify',
        body: `Welcome, ${user.name}! Your ${user.role} account has been set up and is ready to use.`,
        metadata: { action: 'onboarding' },
      });
    }
    console.log(`  Created ${createdUsers.length} welcome notifications`);

    console.log('\n--- Seed Complete ---');
    console.log(`  Institutions: ${createdInstitutions.length}`);
    console.log(`  Users: ${createdUsers.length} (${students.length} students, 1 faculty, 1 admin, 1 recruiter)`);
    console.log(`  Courses: ${createdCourses.length}`);
    console.log(`  Attendance Records: ${attendanceRecords.length}`);
    console.log(`  SEG Entries: ${segCount}`);
    console.log(`  Notifications: ${createdUsers.length}`);

    console.log('\n--- Demo Accounts ---');
    console.log('  Student:   arjun@mrdu.edu / test123');
    console.log('  Faculty:   lakshmi.naidu@mrdu.edu / faculty123');
    console.log('  Admin:     admin@mrdu.edu / admin123');
    console.log('  Recruiter: ravi@techspark.com / recruiter123');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
