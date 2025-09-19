import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [2, 'Role name must be at least 2 characters long'],
    maxlength: [20, 'Role name cannot exceed 20 characters']
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    minlength: [2, 'Display name must be at least 2 characters long'],
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin', 'moderate'],
    default: ['read']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false // System roles cannot be deleted
  },
  userCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });

// Pre-save middleware to update user count
roleSchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    // Check if role name already exists (case insensitive)
    const existingRole = await this.constructor.findOne({ 
      name: { $regex: new RegExp(`^${this.name}$`, 'i') },
      _id: { $ne: this._id }
    });
    
    if (existingRole) {
      const error = new Error('Role name already exists');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Static method to get active roles
roleSchema.statics.getActiveRoles = function() {
  return this.find({ isActive: true }).sort({ displayName: 1 });
};

// Static method to update user count for a role
roleSchema.statics.updateUserCount = async function(roleName) {
  const User = mongoose.model('User');
  const count = await User.countDocuments({ role: roleName });
  await this.updateOne({ name: roleName }, { userCount: count });
};

// Instance method to check if role can be deleted
roleSchema.methods.canBeDeleted = function() {
  return !this.isSystem && this.userCount === 0;
};

const Role = mongoose.model('Role', roleSchema);

export default Role;
