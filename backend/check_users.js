import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const student = await User.findOne({ email: 'arjun@mrdu.edu' });
  console.log('Demo student exists:', !!student);
  if(student) {
      console.log('Password hash:', student.passwordHash);
      const isValid = await bcrypt.compare('Bridgify@2026', student.passwordHash);
      console.log('Is valid:', isValid);
  }
  process.exit(0);
}

checkUsers();
