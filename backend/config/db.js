import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting reconnection...');
    });

    await createIndexes();

    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

async function createIndexes() {
  const db = mongoose.connection.db;

  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.includes('skillevidencegraphs')) {
      const segCollection = db.collection('skillevidencegraphs');
      await segCollection.createIndex({ studentId: 1, skillId: 1 });
      await segCollection.createIndex({ institutionId: 1, skillCategory: 1, confidenceScore: -1 });
      await segCollection.createIndex({ courseId: 1, skillId: 1, studentId: 1 });
      await segCollection.createIndex({ evidenceType: 1, createdAt: -1 });
      console.log('SEG indexes created successfully');
    }
  } catch (error) {
    console.warn('Index creation skipped (collections may not exist yet):', error.message);
  }
}

export default connectDB;
