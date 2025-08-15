import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import OTPVerification from '../../components/OTPVerification';
import api from '../../services/api';
import { 
  EmailIcon, 
  PhoneIcon, 
  RestaurantIcon,
  EcoIcon
} from '../../components/Icons';

const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });

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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOTP = async () => {
    setOtpLoading(true);
    try {
      const response = await api.post('/otp/send-login', {
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
      
      // Store login data for after OTP verification
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailOrPhone);
      const loginData = {
        password: formData.password,
        emailOrPhone: formData.emailOrPhone
      };
      
      if (isEmail) {
        loginData.email = formData.emailOrPhone;
      } else {
        loginData.phone = formData.emailOrPhone;
      }
      
      setPendingLogin(loginData);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to start login process');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async (otp) => {
    if (!pendingLogin) return;
    
    setLoading(true);
    try {
      // Add the OTP to the login data
      const loginData = {
        ...pendingLogin,
        otp
      };
      
      const success = await login(loginData);
      if (success) {
        setShowOTP(false);
        setPendingLogin(null);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPCancel = () => {
    setShowOTP(false);
    setPendingLogin(null);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-slideUp">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-200 p-8">
            <div className="relative">
              <div className="mx-auto h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div className="pointer-events-none select-none absolute -top-6 -right-3 text-2xl animate-float">
                <RestaurantIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div className="pointer-events-none select-none absolute -bottom-6 -left-2 text-2xl animate-drift">
                <EcoIcon className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                create a new account
              </Link>
            </p>
          
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  {errors.emailOrPhone && <p className="text-red-500 text-sm mt-1">{errors.emailOrPhone}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otpLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : otpLoading ? 'Sending OTP...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerification
        emailOrPhone={formData.emailOrPhone}
        type="login"
        onVerificationSuccess={handleOTPVerificationSuccess}
        onCancel={handleOTPCancel}
        isVisible={showOTP}
      />
    </>
  );
};

export default Login; 