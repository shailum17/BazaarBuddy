// Safe logging utility that filters sensitive information

const sensitiveFields = [
  'password',
  'token',
  'jwt',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session'
];

const sanitizeForLogging = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLogging);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains sensitive information
    const isSensitive = sensitiveFields.some(field => 
      lowerKey.includes(field)
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

const safeLog = {
  error: (message, data = {}) => {
    const sanitizedData = sanitizeForLogging(data);
    console.error(message, sanitizedData);
  },
  
  warn: (message, data = {}) => {
    const sanitizedData = sanitizeForLogging(data);
    console.warn(message, sanitizedData);
  },
  
  info: (message, data = {}) => {
    const sanitizedData = sanitizeForLogging(data);
    console.log(message, sanitizedData);
  },
  
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const sanitizedData = sanitizeForLogging(data);
      console.debug(message, sanitizedData);
    }
  }
};

module.exports = { safeLog, sanitizeForLogging };