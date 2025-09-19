import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Role from '../models/Role.js';

// Load environment variables
dotenv.config();

const seedSuperuser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/docsense');
    console.log('✅ Connected to MongoDB');

    // Check if superuser already exists
    const existingSuperuser = await User.findOne({ role: 'superuser' });
    if (existingSuperuser) {
      console.log('⚠️  Superuser already exists:', existingSuperuser.email);
      process.exit(0);
    }

    // Create superuser
    const superuser = new User({
      username: 'superadmin',
      email: 'superadmin@docsense.com',
      phone: '+1234567890',
      role: 'superuser',
      password: 'admin123',
      isApproved: true
    });

    await superuser.save();

    // Update role user count
    await Role.updateUserCount('superuser');

    console.log('✅ Superuser created successfully!');
    console.log('📧 Email: superadmin@docsense.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating superuser:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seed function
seedSuperuser();
