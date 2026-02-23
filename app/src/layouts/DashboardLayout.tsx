import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardLayoutProps {
  allowedRoles?: Array<'student' | 'instructor' | 'admin'>;
}

export function DashboardLayout({ allowedRoles }: DashboardLayoutProps) {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRegForm, setShowRegForm] = useState(false);
  const [formData, setFormData] = useState<{
    primaryExpertise: string;
    experienceLevel: 'Beginner' | 'Intermediate' | 'Expert' | '';
    yearsOfExperience: string;
    currentJobTitle: string;
    organization: string;
  }>({
    primaryExpertise: '',
    experienceLevel: '',
    yearsOfExperience: '',
    currentJobTitle: '',
    organization: ''
  });
  const [formError, setFormError] = useState('');

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryExpertise || !formData.experienceLevel || !formData.yearsOfExperience) {
      setFormError('Please fill out all required fields marked with *');
      return;
    }
    setFormError('');
    await updateUser({
      ...formData,
      yearsOfExperience: parseInt(formData.yearsOfExperience),
      registrationComplete: true
    });
  };

  // Redirect to login (or home for instructor/admin) if not authenticated
  if (!isAuthenticated) {
    if (allowedRoles?.some(role => ['instructor', 'admin'].includes(role))) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check if user has allowed role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    switch (user.role) {
      case 'student':
        return <Navigate to="/student" replace />;
      case 'instructor':
        return <Navigate to="/instructor" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  if (user?.role === 'instructor' && user?.status === 'pending') {
    if (!user.registrationComplete) {
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-2xl border shadow-lg mt-8 mb-8">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>
              </div>
              <h2 className="text-2xl font-bold">Complete Registration</h2>
              <p className="text-muted-foreground">
                Please provide your professional information to complete your instructor application.
              </p>
              {!showRegForm ? (
                <Button onClick={() => setShowRegForm(true)} className="w-full py-6 text-lg">
                  Complete Your Full Registration
                </Button>
              ) : (
                <form onSubmit={handleRegistrationSubmit} className="space-y-4 text-left">
                  <div className="space-y-2">
                    <Label>Primary Expertise <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="e.g., Python, UI/UX, Marketing"
                      value={formData.primaryExpertise}
                      onChange={(e) => setFormData({ ...formData, primaryExpertise: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level <span className="text-destructive">*</span></Label>
                    <Select onValueChange={(v) => setFormData({ ...formData, experienceLevel: v as any })}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience <span className="text-destructive">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 5"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Job Title</Label>
                    <Input
                      placeholder="e.g., Senior Developer"
                      value={formData.currentJobTitle}
                      onChange={(e) => setFormData({ ...formData, currentJobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization / Company</Label>
                    <Input
                      placeholder="e.g., Tech Corp Inc."
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    />
                  </div>
                  {formError && <p className="text-sm text-destructive">{formError}</p>}
                  <Button type="submit" className="w-full">Submit Application</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-2xl border shadow-lg">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <h2 className="text-2xl font-bold">Waiting for Approval</h2>
            <p className="text-muted-foreground">
              Your instructor account is currently pending review by an administrator.
              <br />This process usually takes 24-48 hours.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              We'll notify you via email once your account has been approved and you can start creating courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        showSidebarToggle
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          className={cn(
            'flex-1 transition-all duration-300',
            'lg:ml-64'
          )}
        >
          <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
