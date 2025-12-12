// Standardized error messages for consistency

const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email/phone or password',
    ACCOUNT_LOCKED: 'Account is temporarily locked due to too many failed login attempts',
    TOKEN_EXPIRED: 'Your session has expired. Please login again',
    TOKEN_INVALID: 'Invalid authentication token',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    FORBIDDEN: 'You do not have permission to perform this action',
    USER_NOT_FOUND: 'User account not found',
    EMAIL_EXISTS: 'An account with this email already exists',
    PHONE_EXISTS: 'An account with this phone number already exists',
    REGISTRATION_FAILED: 'Registration failed. Please try again',
    LOGIN_FAILED: 'Login failed. Please check your credentials',
    OTP_REQUIRED: 'OTP verification is required',
    OTP_INVALID: 'Invalid or expired OTP',
    OTP_EXPIRED: 'OTP has expired. Please request a new one',
    TERMS_NOT_ACCEPTED: 'You must accept the Terms of Service and Privacy Policy'
  },

  // Validation errors
  VALIDATION: {
    REQUIRED_FIELD: (field) => `${field} is required`,
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid 10-digit phone number',
    INVALID_PASSWORD: 'Password must contain at least one uppercase letter, lowercase letter, number, and special character',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
    PASSWORD_TOO_LONG: 'Password cannot be more than 128 characters long',
    INVALID_ROLE: 'Role must be either vendor or supplier',
    INVALID_FORMAT: (field) => `Invalid ${field} format`,
    OUT_OF_RANGE: (field, min, max) => `${field} must be between ${min} and ${max}`,
    TOO_LONG: (field, max) => `${field} cannot be more than ${max} characters`,
    TOO_SHORT: (field, min) => `${field} must be at least ${min} characters`
  },

  // Database errors
  DATABASE: {
    CONNECTION_FAILED: 'Database connection failed',
    OPERATION_FAILED: 'Database operation failed',
    DUPLICATE_ENTRY: 'This record already exists',
    NOT_FOUND: 'Record not found',
    CONSTRAINT_VIOLATION: 'Data constraint violation'
  },

  // Business logic errors
  BUSINESS: {
    INSUFFICIENT_STOCK: 'Insufficient stock available',
    ORDER_NOT_FOUND: 'Order not found',
    PRODUCT_NOT_FOUND: 'Product not found',
    SUPPLIER_NOT_FOUND: 'Supplier not found',
    INVALID_ORDER_STATUS: 'Invalid order status transition',
    CANNOT_CANCEL_ORDER: 'This order cannot be cancelled',
    CANNOT_RATE_ORDER: 'This order cannot be rated at this time',
    MINIMUM_ORDER_NOT_MET: 'Minimum order quantity not met'
  },

  // Server errors
  SERVER: {
    INTERNAL_ERROR: 'An internal server error occurred',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
    TIMEOUT: 'Request timeout. Please try again',
    CONFIGURATION_ERROR: 'Server configuration error'
  },

  // External service errors
  EXTERNAL: {
    SMS_FAILED: 'Failed to send SMS notification',
    EMAIL_FAILED: 'Failed to send email notification',
    WHATSAPP_FAILED: 'Failed to send WhatsApp notification',
    PAYMENT_FAILED: 'Payment processing failed'
  }
};

const getErrorMessage = (category, key, ...args) => {
  const categoryMessages = ERROR_MESSAGES[category];
  if (!categoryMessages) {
    return ERROR_MESSAGES.SERVER.INTERNAL_ERROR;
  }

  const message = categoryMessages[key];
  if (!message) {
    return ERROR_MESSAGES.SERVER.INTERNAL_ERROR;
  }

  if (typeof message === 'function') {
    return message(...args);
  }

  return message;
};

module.exports = {
  ERROR_MESSAGES,
  getErrorMessage
};