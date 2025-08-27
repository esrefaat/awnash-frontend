'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faUser,
  faLock,
  faEnvelope,
  faPhone,
  faGlobe,
  faSpinner,
  faShieldAlt,
  faIndustry,
  faTruck,
  faHardHat,
  faGears,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

const Login: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // Form state
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

  // Handle language toggle
  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = isRTL ? 'هذا الحقل مطلوب' : 'This field is required';
    } else if (loginType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailOrPhone)) {
        newErrors.emailOrPhone = isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
      }
    } else {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(formData.emailOrPhone)) {
        newErrors.emailOrPhone = isRTL ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock role-based redirect logic
      const userRole = 'admin'; // This would come from API response
      
      if (userRole === 'admin') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/user-portal';
      }
    } catch (error) {
      setErrors({ general: isRTL ? 'خطأ في تسجيل الدخول' : 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen flex">
        {/* Left side - Brand/Illustration (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 gap-4 h-full p-8">
              {Array.from({length: 64}).map((_, i) => (
                <div key={i} className="bg-white rounded"></div>
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            <div className="max-w-md">
              {/* Logo */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white">Awnash</h1>
                <p className="text-blue-100 mt-2">
                  {isRTL ? 'منصة تأجير المعدات الثقيلة' : 'Heavy Equipment Rental Platform'}
                </p>
              </div>
              
              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-awnash-primary rounded-2xl flex items-center justify-center ${isRTL ? 'ml-4' : 'mr-4'}`}> 
                    <FontAwesomeIcon icon={faTruck} className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isRTL ? 'أسطول ضخم من المعدات' : 'Massive Equipment Fleet'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {isRTL ? 'أكثر من 500 قطعة معدة ثقيلة' : '500+ heavy equipment pieces'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center ${isRTL ? 'ml-4' : 'mr-4'}`}> 
                    <FontAwesomeIcon icon={faShieldAlt} className="text-black h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isRTL ? 'مؤمن بالكامل' : 'Fully Insured'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {isRTL ? 'تأمين شامل لجميع المعدات' : 'Comprehensive insurance coverage'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                    <div className={`w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center ${isRTL ? 'ml-4' : 'mr-4'}`}> 
                    <FontAwesomeIcon icon={faCheckCircle} className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isRTL ? 'خدمة على مدار الساعة' : '24/7 Support'}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {isRTL ? 'دعم فني متاح دائماً' : 'Always available technical support'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Trust message */}
              <div className="mt-12 p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-center text-blue-100">
                  <FontAwesomeIcon icon={faIndustry} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                  {isRTL ? 'موثوق به من قبل قادة البناء في الخليج' : 'Trusted by construction leaders in the Gulf'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-8">
          {/* Mobile logo */}
          <div className="sm:mx-auto sm:w-full sm:max-w-sm lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">Awnash</h1>
            <p className="text-gray-400 mt-2">
              {isRTL ? 'منصة تأجير المعدات الثقيلة' : 'Heavy Equipment Rental Platform'}
            </p>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            {/* Language Toggle */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleLanguageToggle}
                className="flex items-center px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faGlobe} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                {isRTL ? 'تسجيل الدخول' : 'Sign in to your account'}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {isRTL ? 'أو' : 'Or'}{' '}
                <a href="/register" className="text-awnash-accent hover:text-awnash-accent-hover font-medium">
                  {isRTL ? 'إنشاء حساب جديد' : 'create a new account'}
                </a>
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {errors.general}
                </div>
              )}

              {/* Login Type Toggle */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLoginType('email')}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                    loginType === 'email'
                      ? 'bg-awnash-accent text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <FontAwesomeIcon icon={faEnvelope} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('phone')}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                    loginType === 'phone'
                      ? 'bg-awnash-accent text-white'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <FontAwesomeIcon icon={faPhone} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'رقم الهاتف' : 'Phone'}
                </button>
              </div>

              {/* Email/Phone Input */}
              <div>
                <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-300 mb-2">
                  {loginType === 'email' 
                    ? (isRTL ? 'البريد الإلكتروني' : 'Email address')
                    : (isRTL ? 'رقم الهاتف' : 'Phone number')
                  }
                </label>
                <div className="relative">
                  <div className={cn('absolute inset-y-0 flex items-center px-3 pointer-events-none', isRTL ? 'right-0' : 'left-0')}>
                    <FontAwesomeIcon 
                      icon={loginType === 'email' ? faEnvelope : faPhone} 
                      className="h-4 w-4 text-gray-500" 
                    />
                  </div>
                  <input
                    id="emailOrPhone"
                    type={loginType === 'email' ? 'email' : 'tel'}
                    value={formData.emailOrPhone}
                    onChange={(e) => handleInputChange('emailOrPhone', e.target.value)}
                    className={cn(
                      'w-full py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white focus:ring-2 focus:ring-awnash-accent focus:border-transparent',
                      isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3',
                      errors.emailOrPhone && 'border-red-500'
                    )}
                    placeholder={
                      loginType === 'email' 
                        ? (isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email')
                        : (isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number')
                    }
                  />
                </div>
                {errors.emailOrPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.emailOrPhone}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <div className={cn('absolute inset-y-0 flex items-center px-3 pointer-events-none', isRTL ? 'right-0' : 'left-0')}>
                    <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn(
                      'w-full py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white focus:ring-2 focus:ring-awnash-accent focus:border-transparent',
                      isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10',
                      errors.password && 'border-red-500'
                    )}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn('absolute inset-y-0 flex items-center px-3', isRTL ? 'left-0' : 'right-0')}
                  >
                    <FontAwesomeIcon 
                      icon={showPassword ? faEyeSlash : faEye} 
                      className="h-4 w-4 text-gray-500 hover:text-gray-400" 
                    />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-awnash-accent focus:ring-awnash-accent border-gray-600 rounded bg-gray-800"
                  />
                  <label htmlFor="remember-me" className={`${isRTL ? 'ml-2' : 'mr-2'} block text-sm text-gray-300`}>  
                    {isRTL ? 'تذكرني' : 'Remember me'}
                  </label>
                </div>

                <div className="text-sm">
                  <a href="/forgot-password" className="text-awnash-accent hover:text-awnash-accent-hover">
                    {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot your password?'}
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-white bg-awnash-accent hover:bg-awnash-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-awnash-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className={`animate-spin h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
                    {isRTL ? 'جار تسجيل الدخول...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUser} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {isRTL ? 'تسجيل الدخول' : 'Sign in'}
                  </>
                )}
              </button>

              {/* Additional Options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">
                      {isRTL ? 'أو' : 'Or'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-2xl shadow-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all hover:shadow-xl"
                  >
                    <FontAwesomeIcon icon={faGears} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {isRTL ? 'تسجيل دخول بالرمز السريع' : 'Quick Login with OTP'}
                  </button>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                {isRTL ? 'بالمتابعة، أنت توافق على' : 'By continuing, you agree to our'}{' '}
                <a href="/terms" className="text-awnash-accent hover:text-awnash-accent-hover">
                  {isRTL ? 'شروط الخدمة' : 'Terms of Service'}
                </a>{' '}
                {isRTL ? 'و' : 'and'}{' '}
                <a href="/privacy" className="text-awnash-accent hover:text-awnash-accent-hover">
                  {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 