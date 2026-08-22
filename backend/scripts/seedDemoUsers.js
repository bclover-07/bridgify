import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const DEMO_USERS = [
  {
    name: 'Arjun Reddy',
    email: 'arjun@mrdu.edu',
    password: 'Bridgify@2026',
    role: 'student',
    isActive: true,
    student: {
      yearOfStudy: 3,
      department: 'Computer Science',
      gpa: 8.5
    }
  },
  {
    name: 'Prof. Lakshmi Naidu',
    email: 'lakshmi.naidu@mrdu.edu',
    password: 'Bridgify@2026',
    role: 'faculty',
    isActive: true,
    faculty: {
      department: 'Computer Science',
      designation: 'Associate Professor'
    }
  },
  {
    name: 'Institution Admin',
    email: 'admin@mrdu.edu',
    password: 'Bridgify@2026',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Ravi Menon',
    email: 'ravi@techspark.com',
    password: 'Bridgify@2026',
    role: 'recruiter',
    isActive: true,
    recruiter: {
      company: 'TechSpark Innovations',
      designation: 'Technical Recruiter'
    }
  }
];

async function seedDemoUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    for (const userData of DEMO_USERS) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      console.log(`Creating user: ${userData.email}...`);
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      await User.create({
        ...userData,
        passwordHash
      });
      console.log(`Created ${userData.email} successfully.`);
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed:', err);
    process.exit(1);
  }
}

seedDemoUsers();
