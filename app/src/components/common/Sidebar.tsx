import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
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
  Heart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Award,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'Browse Courses', href: '/courses', icon: GraduationCap },
  { label: 'My Courses', href: '/student/courses', icon: BookOpen },
  { label: 'Recommendations', href: '/student/recommendations', icon: Lightbulb },
  { label: 'Progress', href: '/student/progress', icon: TrendingUp },
  { label: 'Certificates', href: '/student/certificates', icon: Award },
  { label: 'Wishlist', href: '/student/wishlist', icon: Heart },
  { label: 'Discussions', href: '/student/discussions', icon: MessageSquare },
  { label: 'Settings', href: '/student/settings', icon: Settings },
];

const instructorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
  { label: 'My Course', href: '/instructor/courses', icon: GraduationCap },
  { label: 'Lessons', href: '/instructor/lessons', icon: Layers },
  { label: 'Question Bank', href: '/instructor/questions', icon: FileQuestion },
  { label: 'Students', href: '/instructor/students', icon: Users },
  { label: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/instructor/settings', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Instructors', href: '/admin/instructors', icon: Users },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
  { label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [adminStats, setAdminStats] = useState({ totalUsers: 0, activeNow: 0, activeCourses: 0 });
  const [studentStats, setStudentStats] = useState({ activeCourses: 0, totalSpent: 0 });

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchAdminStats = async () => {
        try {
          const [usersRes, coursesRes] = await Promise.all([
            api.get('/users'),
            api.get('/courses/all')
          ]);
          const usersData = usersRes.data || [];
          const coursesData = coursesRes.data || [];
          setAdminStats({
            totalUsers: usersData.length,
            activeNow: usersData.filter((u: any) => u.isOnline).length,
            activeCourses: coursesData.filter((c: any) => c.isPublished).length
          });
        } catch (error) {
          console.error('Failed to fetch admin stats:', error);
        }
      };

      fetchAdminStats();
    } else if (user?.role === 'student') {
      const fetchStudentStats = async () => {
        try {
          const [coursesRes, transRes] = await Promise.all([
            api.get('/courses/enrolled/my'),
            api.get('/courses/transactions/my')
          ]);
          setStudentStats({
            activeCourses: coursesRes.data.length,
            totalSpent: transRes.data.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
          });
        } catch (error) {
          console.error('Failed to fetch student stats:', error);
        }
      };
      fetchStudentStats();
    }
  }, [user?.role]);

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
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 py-4">
            <div className="px-3 py-2">
              <div className="mb-4 px-4 text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {!isCollapsed ? (
                    <>
                      {user?.role === 'student' && 'Student Panel'}
                      {user?.role === 'instructor' && 'Instructor Panel'}
                      {user?.role === 'admin' && 'Admin Panel'}
                    </>
                  ) : '-'}
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
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        isCollapsed ? 'justify-center px-2' : 'px-4'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

          </ScrollArea>
          <div className="p-4 border-t space-y-2 shrink-0 bg-background/50 backdrop-blur">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                  isCollapsed ? "justify-center px-1" : "px-3"
                )}
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <ChevronLeft className="h-5 w-5 shrink-0" />}
                {!isCollapsed && <span>Collapse Sidebar</span>}
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              title={isCollapsed ? "Sign Out" : undefined}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors",
                isCollapsed ? "justify-center px-1" : "px-3"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
