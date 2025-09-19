import User from '../models/User.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken, 
  setRefreshTokenCookie, 
  clearRefreshTokenCookie 
} from '../services/tokenService.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { username, email, phone, role, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      phone,
      role: role || 'user',
      password
    });

    await user.save();

    // Update role user count
    const Role = (await import('../models/Role.js')).default;
    await Role.updateUserCount(user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful; awaiting admin approval.',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Account awaiting approval'
      });
    }

    // Check if user is rejected
    if (user.isRejected) {
      return res.status(403).json({
        success: false,
        message: 'Account has been rejected'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });

    const refreshToken = generateRefreshToken({ 
      userId: user._id, 
      email: user.email 
    });

    // Store refresh token in database
    user.generateRefreshToken();
    await user.save();

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Refresh access token
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user and check if refresh token exists in database
    const user = await User.findByRefreshToken(refreshToken);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if user is still approved
    if (!user.isApproved || user.isRejected) {
      return res.status(403).json({
        success: false,
        message: 'Account is not approved or has been rejected'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({ 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Find user and remove refresh token
      const user = await User.findByRefreshToken(refreshToken);
      if (user) {
        user.removeRefreshToken(refreshToken);
        await user.save();
      }
    }

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
