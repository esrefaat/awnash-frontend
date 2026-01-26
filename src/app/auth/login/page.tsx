"use client";

import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUser,
  faLock,
  faEnvelope,
  faSpinner,
  faGears,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import { DemoAccountsPanel } from "@/components/auth/DemoAccountsPanel";

// Configuration: Show demo accounts panel based on environment variable
const SHOW_DEMO_ACCOUNTS = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "true";

const Login: React.FC = () => {
  const { i18n } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  const isRTL = i18n.language === "ar";

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email on mount
  React.useEffect(() => {
    emailRef.current?.focus();
  }, [i18n.language]);

  // Handle language switch
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = isRTL ? "البريد الإلكتروني غير صحيح" : "Invalid email address";
      }
    }
    if (!formData.password) {
      newErrors.password = isRTL ? "كلمة المرور مطلوبة" : "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate email for OTP
  const validateEmailForOtp = () => {
    if (!formData.email.trim()) {
      setErrors({ email: isRTL ? "البريد الإلكتروني مطلوب للرمز السريع" : "Email is required for OTP" });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors({ email: isRTL ? "البريد الإلكتروني غير صحيح" : "Invalid email address" });
      return false;
    }
    setErrors({});
    return true;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Redirect to dashboard on successful login
      router.push("/overview/main-dashboard");
    } catch (error: any) {
      setErrors({ 
        general: error.message || (isRTL ? "خطأ في تسجيل الدخول" : "Login failed")
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP login (placeholder - you can implement this later)
  const handleOtpLogin = async () => {
    if (!validateEmailForOtp()) return;
    setIsOtpLoading(true);
    try {
      // Simulate OTP request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real app, this would send OTP to email and navigate to OTP verification page
      alert(isRTL ? "تم إرسال الرمز السريع إلى بريدك الإلكتروني" : "OTP sent to your email!");
    } catch (error) {
      setErrors({ general: isRTL ? "فشل في إرسال الرمز السريع" : "Failed to send OTP" });
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle demo account selection
  const handleDemoAccountSelect = (email: string, password: string) => {
    setFormData((prev) => ({ ...prev, email, password }));
    setErrors({});
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-[#F4F4F4] dark:bg-black transition-colors py-8 px-4",
        isRTL ? "font-arabic" : "font-montserrat"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "flex flex-col lg:flex-row items-center lg:items-start gap-6 w-full max-w-4xl",
          isRTL ? "lg:flex-row-reverse" : ""
        )}
      >
        {/* Demo Accounts Panel - Left/Right side based on RTL */}
        {SHOW_DEMO_ACCOUNTS && (
          <DemoAccountsPanel
            isRTL={isRTL}
            onSelectAccount={handleDemoAccountSelect}
          />
        )}

        {/* Login Card */}
        <Card
          className={cn(
            "w-full max-w-md p-6 rounded-2xl shadow-lg space-y-4 bg-white dark:bg-[#18181b] border-0",
            !SHOW_DEMO_ACCOUNTS && "mx-auto"
          )}
        >
        {/* Language Switcher */}
        <div className="flex justify-end">
          <Select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="w-28 text-sm font-medium border-[#0073E6] focus:ring-[#0073E6] focus:border-[#0073E6]"
            aria-label={isRTL ? "تغيير اللغة" : "Change language"}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </Select>
        </div>
        <CardHeader className="pb-0">
          <CardTitle className="text-center text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {isRTL ? "تسجيل الدخول للوحة التحكم" : "Admin Dashboard Login"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form className="space-y-4" onSubmit={handleLogin} method="post" autoComplete="off">
            {errors.general && (
              <div className="text-red-500 text-center text-sm mb-2">{errors.general}</div>
            )}
            {/* Email */}
            <div>
              <Label htmlFor="email" className="block mb-1">
                {isRTL ? "البريد الإلكتروني" : "Email"}
              </Label>
              <div className="relative">
                <span className={cn("absolute inset-y-0 flex items-center px-3 text-[#0073E6]", isRTL ? "right-0" : "left-0")}
                  >
                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                </span>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  ref={emailRef}
                  autoFocus
                  autoComplete="username"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={cn(
                    "pl-10 pr-3 dark:bg-[#23272f] bg-[#F4F4F4] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400",
                    isRTL ? "pr-10 pl-3" : "pl-10 pr-3",
                    errors.email && "border-red-500 focus:ring-red-500"
                  )}
                  placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
            {/* Password */}
            <div>
              <Label htmlFor="password" className="block mb-1">
                {isRTL ? "كلمة المرور" : "Password"}
              </Label>
              <div className="relative">
                <span className={cn("absolute inset-y-0 flex items-center px-3 text-[#0073E6]", isRTL ? "right-0" : "left-0")}
                  >
                  <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={cn(
                    "pl-10 pr-10 dark:bg-[#23272f] bg-[#F4F4F4] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400",
                    isRTL ? "pr-10 pl-10" : "pl-10 pr-10",
                    errors.password && "border-red-500 focus:ring-red-500"
                  )}
                  placeholder={isRTL ? "أدخل كلمة المرور" : "Enter your password"}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  tabIndex={0}
                  aria-label={showPassword ? (isRTL ? "إخفاء كلمة المرور" : "Hide password") : (isRTL ? "إظهار كلمة المرور" : "Show password")}
                  onClick={() => setShowPassword((v) => !v)}
                  className={cn(
                    "absolute inset-y-0 flex items-center px-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none",
                    isRTL ? "left-0" : "right-0"
                  )}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-500">
                  {errors.password}
                </p>
              )}
            </div>
            
            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}> 
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                  className="h-4 w-4 text-[#0073E6] focus:ring-[#0073E6] border-gray-300 rounded"
                />
                <Label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  {isRTL ? "تذكرني" : "Remember me"}
                </Label>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  // Handle forgot password logic here
                  console.log('Forgot password clicked');
                }}
                className="text-sm font-medium text-[#0073E6] hover:underline focus:underline focus:outline-none bg-transparent border-none cursor-pointer"
              >
                {isRTL ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 rounded-2xl font-bold text-base bg-[#FFCC00] hover:bg-[#E6B800] text-black shadow-lg focus:ring-2 focus:ring-[#FFCC00] focus:ring-offset-2 focus:outline-none transition-all flex items-center justify-center gap-2",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin h-4 w-4" />
                  <span>{isRTL ? "جاري الدخول..." : "Logging in..."}</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUser} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  <span>{isRTL ? "تسجيل الدخول" : "Login"}</span>
                </>
              )}
            </Button>

            {/* Alternative Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#18181b] text-gray-500 dark:text-gray-400">
                    {isRTL ? "أو" : "Or"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  onClick={handleOtpLogin}
                  disabled={isOtpLoading}
                  variant="outline"
                  className={cn(
                    "w-full py-3 rounded-2xl font-medium text-sm border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-[#0073E6] focus:ring-offset-2 transition-all flex items-center justify-center gap-2",
                    isOtpLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isOtpLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin h-4 w-4" />
                      <span>{isRTL ? "جاري الإرسال..." : "Sending..."}</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faGears} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      <span>{isRTL ? "تسجيل دخول بالرمز السريع" : "Quick Login with OTP"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Login; 