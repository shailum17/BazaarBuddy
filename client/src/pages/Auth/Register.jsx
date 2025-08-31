import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import OTPVerification from '../../components/OTPVerification';
import api from '../../services/api';
import { 
  PersonIcon, 
  EmailIcon, 
  PhoneIcon, 
  LocationIcon, 
  LockIcon, 
  VisibilityIcon, 
  VisibilityOffIcon,
  RestaurantIcon,
  EcoIcon
} from '../../components/Icons';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
    location: '',
    role: 'vendor',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }
    
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required';
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailOrPhone);
      const isPhone = /^[0-9]{10}$/.test(formData.emailOrPhone);
      if (!isEmail && !isPhone) {
        newErrors.emailOrPhone = 'Please enter a valid email or 10-digit phone number';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service and Privacy Policy to continue';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOTP = async () => {
    setOtpLoading(true);
    try {
      const response = await api.post('/otp/send-registration', {
        emailOrPhone: formData.emailOrPhone
      });

      if (response.data.success) {
        toast.success(`OTP sent to your ${formData.emailOrPhone.includes('@') ? 'email' : 'phone'}!`);
        setShowOTP(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      // Send OTP first
      await sendOTP();
      
      // Store registration data for after OTP verification
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailOrPhone);
      const userData = {
        name: formData.name,
        location: formData.location,
        role: formData.role,
        password: formData.password,
        emailOrPhone: formData.emailOrPhone,
        acceptTerms: formData.acceptTerms
      };
      
      if (isEmail) {
        userData.email = formData.emailOrPhone;
      } else {
        userData.phone = formData.emailOrPhone;
      }
      
      setPendingRegistration(userData);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to start registration process');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async (otp) => {
    if (!pendingRegistration) return;
    
    setLoading(true);
    try {
      // Add the OTP to the registration data
      const registrationData = {
        ...pendingRegistration,
        otp
      };
      
      const success = await register(registrationData);
      if (success) {
        setShowOTP(false);
        setPendingRegistration(null);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPCancel = () => {
    setShowOTP(false);
    setPendingRegistration(null);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch p-8">
          <div className="w-full space-y-8 animate-slideUp">
            <div className="relative">
              <img src="/assets/Logo.png" alt="BazaarBuddy" className="mx-auto h-12 w-12" />
              <div className="pointer-events-none select-none absolute -top-6 -right-3 text-2xl animate-float">
                <RestaurantIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div className="pointer-events-none select-none absolute -bottom-6 -left-2 text-2xl animate-drift">
                <EcoIcon className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                sign in to your existing account
              </Link>
            </p>
          
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PersonIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email or Phone */}
                <div>
                  <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {formData.emailOrPhone.includes('@') ? (
                        <EmailIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      id="emailOrPhone"
                      name="emailOrPhone"
                      type="text"
                      autoComplete="email"
                      required
                      value={formData.emailOrPhone}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.emailOrPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                      placeholder="Enter your email or phone number"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">You can register with either your email address or phone number</p>
                  {errors.emailOrPhone && <p className="text-red-500 text-sm mt-1">{errors.emailOrPhone}</p>}
                </div>

                {/* Location/City */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location/City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LocationIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      autoComplete="street-address"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                      placeholder="Enter your city"
                    />
                  </div>
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                      placeholder="Create a password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon className="w-5 h-5" />
                        ) : (
                          <VisibilityIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffIcon className="w-5 h-5" />
                        ) : (
                          <VisibilityIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am a:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex cursor-pointer rounded-lg border-2 bg-white p-4 shadow-sm focus:outline-none transition-all duration-200 hover:shadow-md">
                      <input
                        type="radio"
                        name="role"
                        value="vendor"
                        checked={formData.role === 'vendor'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="block text-sm font-medium text-gray-900">
                            Street Food Vendor
                          </span>
                          <span className="mt-1 flex items-center text-sm text-gray-500">
                            I want to buy ingredients
                          </span>
                        </span>
                      </span>
                      <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 transition-all duration-200 ${
                        formData.role === 'vendor' ? 'border-primary-500' : 'border-gray-200'
                      }`} />
                    </label>
                    
                    <label className="relative flex cursor-pointer rounded-lg border-2 bg-white p-4 shadow-sm focus:outline-none transition-all duration-200 hover:shadow-md">
                      <input
                        type="radio"
                        name="role"
                        value="supplier"
                        checked={formData.role === 'supplier'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            Ingredient Supplier
                          </span>
                          <span className="mt-1 flex items-center text-sm text-gray-500">
                            I want to sell ingredients
                          </span>
                        </span>
                      </span>
                      <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 transition-all duration-200 ${
                        formData.role === 'supplier' ? 'border-primary-500' : 'border-gray-200'
                      }`} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    required
                    checked={formData.acceptTerms || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="acceptTerms" className={`cursor-pointer transition-colors ${formData.acceptTerms ? 'text-gray-900' : 'text-gray-700'}`}>
                    I agree to the{' '}
                    <a href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm mt-1">{errors.acceptTerms}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || otpLoading || !formData.acceptTerms}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 ${
                    !formData.acceptTerms 
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                      : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : otpLoading ? 'Sending OTP...' : 'Create Account'}
                </button>
                
                {!formData.acceptTerms && (
                  <p className="mt-2 text-center text-sm text-gray-500">
                    Please accept the terms and conditions to continue
                  </p>
                )}
              </div>
            </form>
          </div>
          <div className="animate-slideUp">
            <video className="rounded-2xl h-full w-full object-contain" src="/assets/Sign_up.mp4" autoPlay loop muted />
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerification
        emailOrPhone={formData.emailOrPhone}
        type="registration"
        onVerificationSuccess={handleOTPVerificationSuccess}
        onCancel={handleOTPCancel}
        isVisible={showOTP}
      />
    </>
  );
};

export default Register;