import Role from '../models/Role.js';
import User from '../models/User.js';

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({}).sort({ displayName: 1 });
    
    res.json({
      success: true,
      message: 'Roles retrieved successfully',
      data: {
        roles
      }
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get active roles (for registration)
export const getActiveRoles = async (req, res) => {
  try {
    const roles = await Role.getActiveRoles();
    
    res.json({
      success: true,
      message: 'Active roles retrieved successfully',
      data: {
        roles: roles.map(role => ({
          name: role.name,
          displayName: role.displayName,
          description: role.description
        }))
      }
    });
  } catch (error) {
    console.error('Get active roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new role
export const createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    const role = new Role({
      name: name.toUpperCase(),
      displayName,
      description,
      permissions: permissions || ['read']
    });

    await role.save();

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: {
        role: {
          id: role._id,
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          permissions: role.permissions,
          isActive: role.isActive,
          userCount: role.userCount
        }
      }
    });
  } catch (error) {
    console.error('Create role error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update role
export const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { displayName, description, permissions, isActive } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify system roles'
      });
    }

    // Update fields
    if (displayName !== undefined) role.displayName = displayName;
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: {
        role: {
          id: role._id,
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          permissions: role.permissions,
          isActive: role.isActive,
          userCount: role.userCount
        }
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if role can be deleted
    if (!role.canBeDeleted()) {
      return res.status(400).json({
        success: false,
        message: role.isSystem 
          ? 'Cannot delete system roles'
          : 'Cannot delete role with existing users. Please reassign or remove all users with this role first.'
      });
    }

    await Role.findByIdAndDelete(roleId);

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get role statistics
export const getRoleStats = async (req, res) => {
  try {
    const roles = await Role.find({});
    const stats = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role.name });
        await Role.updateUserCount(role.name);
        return {
          id: role._id,
          name: role.name,
          displayName: role.displayName,
          userCount,
          isActive: role.isActive,
          isSystem: role.isSystem
        };
      })
    );

    res.json({
      success: true,
      message: 'Role statistics retrieved successfully',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
