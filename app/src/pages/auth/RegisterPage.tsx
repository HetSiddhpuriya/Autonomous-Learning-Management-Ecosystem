import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Users, Shield, Phone, ChevronDown, ArrowLeft, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.terms = 'Please agree to the terms and conditions';
    }

    if (!isEmailVerified) {
      newErrors.email = 'Please verify your email address first.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const success = await register(name, email, password, role, phone, gender);

    if (success) {
      // Redirect based on role
      switch (role) {
        case 'student':
          navigate('/student');
          break;
        case 'instructor':
          navigate('/instructor');
          break;
        case 'admin':
          navigate('/admin');
          break;
      }
    } else {
      setErrors({ email: 'Email already exists' });
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student', icon: GraduationCap, description: 'Learn and grow' },
    { value: 'instructor', label: 'Instructor', icon: Users, description: 'Teach and inspire' },
  ];

  const handleSendOtp = async () => {
    // Validate email first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address to verify' }));
      return;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    setIsOtpSending(true);
    setOtpError('');
    setOtpMessage('');
    try {
      await api.post('/auth/send-otp', { email });
      setIsOtpSent(true);
      setOtpMessage('OTP sent! Please check your email.');
    } catch (err: any) {
      setErrors(prev => ({ ...prev, email: err.response?.data?.message || 'Failed to send OTP (backend might need restart).' }));
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('Please enter the OTP');
      return;
    }
    setIsOtpVerifying(true);
    setOtpError('');
    setOtpMessage('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setIsEmailVerified(true);
      setIsOtpSent(false); // Hide the OTP field
      setOtpMessage('Email verified successfully!');
      setOtp(''); // Clear OTP
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Start your learning journey with LearnFlux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I want to <span className="text-destructive">*</span></Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                className="grid grid-cols-2 gap-2"
              >
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value}>
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isEmailVerified}
                    className={`pl-10 pr-10 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {isEmailVerified && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {!isEmailVerified && (
                  <Button
                    type="button"
                    variant={isOtpSent ? "outline" : "default"}
                    onClick={handleSendOtp}
                    disabled={isOtpSending || !email}
                  >
                    {isOtpSending ? 'Sending...' : isOtpSent ? 'Resend OTP' : 'Verify'}
                  </Button>
                )}
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* OTP Field (Visible only when OTP is sent and email is not yet verified) */}
            {isOtpSent && !isEmailVerified && (
              <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                <Label htmlFor="otp">Enter Verification Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`bg-background ${otpError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    maxLength={6}
                  />
                  <Button type="button" onClick={handleVerifyOtp} disabled={isOtpVerifying || !otp}>
                    {isOtpVerifying ? 'Verifying...' : 'Submit'}
                  </Button>
                </div>
                {otpMessage && <p className="text-xs text-green-600">{otpMessage}</p>}
                {otpError && <p className="text-xs text-destructive">{otpError}</p>}
              </div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`pl-10 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" className={errors.gender ? 'border-destructive focus:ring-destructive' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
            </div>
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className={errors.terms ? 'border-destructive' : ''}
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              {errors.terms && <p className="text-xs text-destructive mt-1">{errors.terms}</p>}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isLoading || !agreeTerms || !isEmailVerified}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm space-y-4">
            <div>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
            <div>
              <Link to="/" className="text-muted-foreground hover:text-foreground inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div >
  );
}
