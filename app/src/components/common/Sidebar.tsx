import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  Settings,
  Users,
  FileQuestion,
  BarChart3,
  PlusCircle,
  Layers,
  Lightbulb,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'My Courses', href: '/student/courses', icon: BookOpen },
  { label: 'Recommendations', href: '/student/recommendations', icon: Lightbulb },
  { label: 'Progress', href: '/student/progress', icon: TrendingUp },
  { label: 'Discussions', href: '/student/discussions', icon: MessageSquare },
  { label: 'Settings', href: '/student/settings', icon: Settings },
];

const instructorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
  { label: 'Create Course', href: '/instructor/create-course', icon: PlusCircle },
  { label: 'Lessons', href: '/instructor/lessons', icon: Layers },
  { label: 'Question Bank', href: '/instructor/questions', icon: FileQuestion },
  { label: 'Students', href: '/instructor/students', icon: Users },
  { label: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/instructor/settings', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
  { label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case 'student':
        return studentNavItems;
      case 'instructor':
        return instructorNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full py-4">
          <div className="px-3 py-2">
            <div className="mb-4 px-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {user?.role === 'student' && 'Student Panel'}
                {user?.role === 'instructor' && 'Instructor Panel'}
                {user?.role === 'admin' && 'Admin Panel'}
              </p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => onClose()}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Stats */}
          <div className="mt-auto px-3 py-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Quick Stats
              </p>
              {user?.role === 'student' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Streak</span>
                    <span className="font-medium">12 days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Courses</span>
                    <span className="font-medium">3 active</span>
                  </div>
                </div>
              )}
              {user?.role === 'instructor' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">1,250</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Courses</span>
                    <span className="font-medium">5 published</span>
                  </div>
                </div>
              )}
              {user?.role === 'admin' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="font-medium">8,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Now</span>
                    <span className="font-medium">342</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
