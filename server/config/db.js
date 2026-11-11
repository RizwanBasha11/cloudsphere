import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudsphere';

  try {
    // Disable Mongoose command buffering to prevent hanging on operations
    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[CloudSphere DB] Successfully connected to live MongoDB daemon at: ${uri}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.log(`[CloudSphere DB] Live MongoDB daemon not running locally (${err.message}).`);
    console.log(`[CloudSphere DB] Activated Zero-Config High-Performance Persistent Document Store (data/cloudsphere.json).`);
    return false;
  }
};

export const getDBStatus = () => {
  return {
    connected: isConnected,
    mode: isConnected ? 'Live MongoDB Server' : 'Persistent Zero-Config Engine (Local File-Backed)',
    host: isConnected ? mongoose.connection.host : 'local-data-store',
    name: 'cloudsphere',
  };
};

export const closeDB = async () => {
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
};
