import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';

async function resetPasswords() {
  await mongoose.connect(process.env.MONGODB_URI);
  const emails = ['arjun@mrdu.edu', 'lakshmi.naidu@mrdu.edu', 'admin@mrdu.edu', 'ravi@techspark.com'];
  const newPasswordHash = await bcrypt.hash('Bridgify@2026', 12);
  
  for(const email of emails) {
      const user = await User.findOneAndUpdate({ email: email }, { passwordHash: newPasswordHash }, { new: true });
      if(user) {
          console.log(`Reset password for ${email}`);
      } else {
          console.log(`User ${email} not found!`);
      }
  }
  process.exit(0);
}

resetPasswords();
