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
import DriveEvent from '../models/DriveEvent.js';
import Assessment from '../models/Assessment.js';
import Submission from '../models/Submission.js';
import FeedPost from '../models/FeedPost.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import TechnologyDemand from '../models/TechnologyDemand.js';

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
      DriveEvent.deleteMany({}),
      Assessment.deleteMany({}),
      Submission.deleteMany({}),
      FeedPost.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      TechnologyDemand.deleteMany({}),
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
    const recruiter = createdUsers.find((u) => u.role === 'recruiter');
    const admin = createdUsers.find((u) => u.role === 'admin');

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

    console.log('Seeding Drive Events (Opportunities)...');
    const drives = await DriveEvent.insertMany([
      {
        institutionId: mrdu._id,
        recruiterId: recruiter._id,
        company: 'Google Cloud Labs',
        roles: [{ title: 'Associate Cloud Engineer', vacancies: 15, packageOffered: 1800000 }],
        driveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'active',
        registrations: students.map((s) => ({
          studentId: s._id,
          stage: 'applied',
          registeredAt: new Date(),
        })),
      },
      {
        institutionId: mrdu._id,
        recruiterId: recruiter._id,
        company: 'Amazon Web Services',
        roles: [{ title: 'Software Development Engineer I', vacancies: 25, packageOffered: 2400000 }],
        driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        registrations: [],
      },
      {
        institutionId: mrdu._id,
        recruiterId: recruiter._id,
        company: 'TechSpark Solutions',
        roles: [{ title: 'Fullstack React Developer', vacancies: 10, packageOffered: 1400000 }],
        driveDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'active',
        registrations: [],
      },
    ]);
    console.log(`  Created ${drives.length} drive events`);

    console.log('Seeding Assessments & Submissions...');
    const sampleAssessment = await Assessment.create({
      institutionId: mrdu._id,
      courseId: createdCourses[0]._id,
      facultyId: faculty._id,
      title: 'Fullstack Microservices & Architecture Quiz',
      topic: 'Microservices & System Design',
      difficulty: 'medium',
      questions: [
        {
          questionText: 'What is the primary benefit of event-driven microservice architecture?',
          type: 'mcq',
          options: [
            { text: 'Tight coupling', isCorrect: false },
            { text: 'Asynchronous decoupling & scale', isCorrect: true },
            { text: 'Single database', isCorrect: false },
            { text: 'Monolithic deployment', isCorrect: false },
          ],
          bloomLevel: 'apply',
          maxMarks: 10,
          skillId: 'CS_SYS_01',
        },
        {
          questionText: 'Which index type speeds up vector similarity search in Mongo/Redis?',
          type: 'mcq',
          options: [
            { text: 'B-Tree', isCorrect: false },
            { text: 'HNSW / IVF', isCorrect: true },
            { text: 'Hash', isCorrect: false },
            { text: 'Text', isCorrect: false },
          ],
          bloomLevel: 'apply',
          maxMarks: 10,
          skillId: 'CS_DB_01',
        },
      ],
      totalMarks: 20,
      duration: 30,
      status: 'published',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    for (const student of students) {
      await Submission.create({
        studentId: student._id,
        assessmentId: sampleAssessment._id,
        answers: [
          { questionId: sampleAssessment.questions[0]._id, response: '1', finalScore: 10 },
          { questionId: sampleAssessment.questions[1]._id, response: '1', finalScore: 10 },
        ],
        totalScore: 20,
        percentage: 100,
        gradingStatus: 'final',
        submittedAt: new Date(),
      });
    }
    console.log(`  Created assessment and ${students.length} submissions`);

    console.log('Seeding Global Feed Posts...');
    await FeedPost.insertMany([
      {
        authorId: recruiter._id,
        authorRole: 'recruiter',
        title: 'TechSpark Tech Hiring Drive 2026 Open!',
        content: 'We are hiring 15 Fullstack Engineer interns who are proficient in React, Node.js, and System Design. Apply directly through the Opportunities portal!',
        category: 'hiring',
        tags: ['Hiring', 'Fullstack', 'Internship'],
        likes: [students[0]._id, students[1]._id],
      },
      {
        authorId: faculty._id,
        authorRole: 'faculty',
        title: 'New AI & LLM Systems Notes Published',
        content: 'I have published new notes on Transformer architectures and Vector Indexing for CS301. Check the Study Hub resources section.',
        category: 'research',
        tags: ['AI', 'SystemDesign', 'Notes'],
        likes: [students[0]._id],
      },
      {
        authorId: students[0]._id,
        authorRole: 'student',
        title: 'Built an AI Agent with Gemini 2.5 & LangGraph!',
        content: 'Excited to share that I completed a fullstack agentic application with real-time Socket.io and high-level readiness scoring. My SEG score jumped +15 points!',
        category: 'skill_update',
        tags: ['AI', 'React', 'Milestone'],
        likes: [faculty._id, recruiter._id],
      },
    ]);
    console.log('  Created global feed posts');

    console.log('Seeding Real-time Conversations & Messages...');
    const demoConv = await Conversation.create({
      participants: [faculty._id, students[0]._id],
      lastMessage: 'Great progress on your system design assignment Arjun!',
      lastMessageAt: new Date(),
    });

    await Message.insertMany([
      {
        conversationId: demoConv._id,
        senderId: students[0]._id,
        content: 'Hello Professor Naidu, I had a quick question regarding the microservices rubric.',
      },
      {
        conversationId: demoConv._id,
        senderId: faculty._id,
        content: 'Great progress on your system design assignment Arjun! Review section 3 of the syllabus notes.',
      },
    ]);
    console.log('  Created demo chat conversation and messages');

    console.log('Seeding Technology Demands (Learning Feed)...');
    await TechnologyDemand.insertMany([
      {
        recruiterId: recruiter._id,
        skillTag: 'CS_FE_01',
        technology: 'Next.js 16 & Server Actions',
        demandFrequency: 'critical',
        description: 'High industry demand for fullstack developers proficient in Next.js Server Components and App Router.',
        isActive: true,
      },
      {
        recruiterId: recruiter._id,
        skillTag: 'CS_OPS_01',
        technology: 'Docker & Kubernetes Containerization',
        demandFrequency: 'high',
        description: 'Container orchestration skills for microservices deployment.',
        isActive: true,
      },
    ]);
    console.log('  Created industry technology demands');

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
          confidenceScore: Math.floor(Math.random() * 25) + 65,
          decayRate: 0.08,
          lastReinforced: new Date(),
          evidenceWeight: 0.8,
          verificationMethod: 'faculty_reviewed',
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
    console.log(`  Drives: ${drives.length}`);
    console.log(`  Assessments & Submissions: 1 / ${students.length}`);
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

