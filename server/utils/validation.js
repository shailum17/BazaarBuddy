// Centralized validation rules to ensure consistency

const passwordValidation = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialCharsPattern: /[!@#$%^&*(),.?":{}|<>]/
};

const validatePassword = (password) => {
    const errors = [];

    if (!password) {
        errors.push('Password is required');
        return errors;
    }

    if (password.length < passwordValidation.minLength) {
        errors.push(`Password must be at least ${passwordValidation.minLength} characters`);
    }

    if (password.length > passwordValidation.maxLength) {
        errors.push(`Password cannot be more than ${passwordValidation.maxLength} characters`);
    }

    if (passwordValidation.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must include at least one uppercase letter');
    }

    if (passwordValidation.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must include at least one lowercase letter');
    }

    if (passwordValidation.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must include at least one number');
    }

    if (passwordValidation.requireSpecialChars && !passwordValidation.specialCharsPattern.test(password)) {
        errors.push('Password must include at least one special character');
    }

    return errors;
};

const getPasswordValidationRules = () => ({
    isLength: { min: passwordValidation.minLength, max: passwordValidation.maxLength },
    matches: [
        { pattern: /[A-Z]/, message: 'Password must include at least one uppercase letter' },
        { pattern: /[a-z]/, message: 'Password must include at least one lowercase letter' },
        { pattern: /\d/, message: 'Password must include at least one number' },
        { pattern: passwordValidation.specialCharsPattern, message: 'Password must include at least one special character' }
    ]
});

module.exports = {
    passwordValidation,
    validatePassword,
    getPasswordValidationRules
};