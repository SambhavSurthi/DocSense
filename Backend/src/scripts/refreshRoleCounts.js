import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const refreshRoleCounts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/docsense');
    console.log('✅ Connected to MongoDB');

    // Get all roles
    const roles = await Role.find({});
    console.log(`📋 Found ${roles.length} roles`);

    // Update user count for each role
    for (const role of roles) {
      const userCount = await User.countDocuments({ role: role.name });
      await Role.updateUserCount(role.name);
      console.log(`✅ Updated ${role.displayName} (${role.name}): ${userCount} users`);
    }

    console.log('✅ All role counts refreshed successfully!');

  } catch (error) {
    console.error('❌ Error refreshing role counts:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the refresh function
refreshRoleCounts();
