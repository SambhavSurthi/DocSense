import Joi from 'joi';

// Registration validation schema
export const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .trim()
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
      'any.required': 'Phone number is required'
    }),
  role: Joi.string()
    .required()
    .messages({
      'any.required': 'Role is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  passwordConfirm: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match password',
      'any.required': 'Password confirmation is required'
    })
});

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// User update validation schema
export const updateUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .trim()
    .optional(),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number'
    })
});

// User role update validation schema
export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .required()
    .messages({
      'any.required': 'Role is required'
    })
});

// Create role validation schema
export const createRoleSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(20)
    .trim()
    .required()
    .messages({
      'string.min': 'Role name must be at least 2 characters long',
      'string.max': 'Role name cannot exceed 20 characters',
      'any.required': 'Role name is required'
    }),
  displayName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Display name must be at least 2 characters long',
      'string.max': 'Display name cannot exceed 50 characters',
      'any.required': 'Display name is required'
    }),
  description: Joi.string()
    .max(200)
    .trim()
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 200 characters'
    }),
  permissions: Joi.array()
    .items(Joi.string().valid('read', 'write', 'delete', 'admin', 'moderate'))
    .optional()
    .messages({
      'array.items': 'Invalid permission type'
    })
});

// Update role validation schema
export const updateRoleSchema = Joi.object({
  displayName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Display name must be at least 2 characters long',
      'string.max': 'Display name cannot exceed 50 characters'
    }),
  description: Joi.string()
    .max(200)
    .trim()
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 200 characters'
    }),
  permissions: Joi.array()
    .items(Joi.string().valid('read', 'write', 'delete', 'admin', 'moderate'))
    .optional()
    .messages({
      'array.items': 'Invalid permission type'
    }),
  isActive: Joi.boolean()
    .optional()
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }

    req.body = value;
    next();
  };
};
