import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  allowedRoles?: Array<'student' | 'instructor' | 'admin'>;
}

export function DashboardLayout({ allowedRoles }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
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
