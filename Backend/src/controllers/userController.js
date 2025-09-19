import User from '../models/User.js';

// Get user documents (placeholder)
export const getDocuments = async (req, res) => {
  try {
    // This is a placeholder for future document functionality
    const documents = [
      {
        id: 1,
        title: 'Sample Document 1',
        type: 'PDF',
        size: '2.5 MB',
        uploadedAt: new Date().toISOString(),
        status: 'Active'
      },
      {
        id: 2,
        title: 'Sample Document 2',
        type: 'DOCX',
        size: '1.8 MB',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'Active'
      }
    ];

    res.json({
      success: true,
      message: 'Documents retrieved successfully',
      data: {
        documents,
        count: documents.length
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user personalization settings
export const updatePersonalization = async (req, res) => {
  try {
    const { userId } = req.user;
    const { username, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (username) user.username = username;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Personalization updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isApproved: user.isApproved
        }
      }
    });
  } catch (error) {
    console.error('Update personalization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
