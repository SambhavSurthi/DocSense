import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role.js';

// Load environment variables
dotenv.config();

const seedRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/docsense');
    console.log('✅ Connected to MongoDB');

    // Check if roles already exist
    const existingRoles = await Role.find({});
    if (existingRoles.length > 0) {
      console.log('⚠️  Roles already exist:', existingRoles.map(r => r.name).join(', '));
      process.exit(0);
    }

    // Create default roles
    const defaultRoles = [
      {
        name: 'USER',
        displayName: 'User',
        description: 'Standard user with basic access',
        permissions: ['read'],
        isSystem: true,
        isActive: true
      },
      {
        name: 'SUPERUSER',
        displayName: 'Superuser',
        description: 'Administrator with full system access',
        permissions: ['read', 'write', 'delete', 'admin'],
        isSystem: true,
        isActive: true
      },
      {
        name: 'MODERATOR',
        displayName: 'Moderator',
        description: 'User with moderation capabilities',
        permissions: ['read', 'write', 'moderate'],
        isSystem: false,
        isActive: true
      },
      {
        name: 'EDITOR',
        displayName: 'Editor',
        description: 'User with content editing permissions',
        permissions: ['read', 'write'],
        isSystem: false,
        isActive: true
      }
    ];

    for (const roleData of defaultRoles) {
      const role = new Role(roleData);
      await role.save();
      console.log(`✅ Created role: ${role.displayName} (${role.name})`);
    }

    console.log('✅ Default roles created successfully!');
    console.log('📋 Available roles:');
    defaultRoles.forEach(role => {
      console.log(`   - ${role.displayName} (${role.name}): ${role.description}`);
    });

  } catch (error) {
    console.error('❌ Error creating roles:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seed function
seedRoles();
