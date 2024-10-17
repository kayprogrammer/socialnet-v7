import mongoose from 'mongoose';
import env from './config';

const connectDB = async (uri: string = env.MONGO_URI) => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
