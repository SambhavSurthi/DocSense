// Role-based access control middleware
export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    
    // Check if user role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Access denied.'
      });
    }

    next();
  };
};

// Specific role middlewares for convenience
export const superuserOnly = roleMiddleware(['superuser']);
export const userOnly = roleMiddleware(['user']);
export const anyRole = roleMiddleware(['user', 'superuser']);
