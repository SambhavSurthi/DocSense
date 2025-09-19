import User from '../models/User.js';

// Get all pending user requests
export const getPendingRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      isApproved: false, 
      isRejected: false 
    }).select('-password -refreshTokens').sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Pending requests retrieved successfully',
      data: {
        users: pendingUsers,
        count: pendingUsers.length
      }
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Approve user request
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    if (user.isRejected) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve a rejected user'
      });
    }

    user.isApproved = true;
    await user.save();

    res.json({
      success: true,
      message: 'User approved successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          approvedAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reject user request
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already approved user'
      });
    }

    if (user.isRejected) {
      return res.status(400).json({
        success: false,
        message: 'User is already rejected'
      });
    }

    user.isRejected = true;
    await user.save();

    res.json({
      success: true,
      message: 'User rejected successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isRejected: user.isRejected,
          rejectedAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users (for superuser dashboard)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });

    const stats = {
      total: users.length,
      approved: users.filter(u => u.isApproved && !u.isRejected).length,
      pending: users.filter(u => !u.isApproved && !u.isRejected).length,
      rejected: users.filter(u => u.isRejected).length,
      superusers: users.filter(u => u.role === 'superuser').length
    };

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        stats
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Import Role model
    const Role = (await import('../models/Role.js')).default;

    // Validate role exists and is active
    const roleExists = await Role.findOne({ name: role.toUpperCase(), isActive: true });
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must exist and be active.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role
    if (req.user.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const oldRole = user.role;
    user.role = role.toUpperCase();
    await user.save();

    // Update role user counts
    await Role.updateUserCount(oldRole);
    await Role.updateUserCount(user.role);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user permanently
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Prevent deleting the last superuser
    if (user.role === 'superuser') {
      const superuserCount = await User.countDocuments({ role: 'superuser' });
      if (superuserCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last superuser account'
        });
      }
    }

    const userRole = user.role;
    
    await User.findByIdAndDelete(userId);

    // Update role user count
    const Role = (await import('../models/Role.js')).default;
    await Role.updateUserCount(userRole);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Toggle user approval status
export const toggleUserApproval = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle approval status
    user.isApproved = !user.isApproved;
    if (user.isApproved) {
      user.isRejected = false; // Clear rejection if approving
    }
    
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isApproved ? 'approved' : 'disapproved'} successfully`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          isRejected: user.isRejected
        }
      }
    });
  } catch (error) {
    console.error('Toggle user approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
