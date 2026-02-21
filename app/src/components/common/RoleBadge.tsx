import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { GraduationCap, Users, Shield } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export function RoleBadge({
  role,
  showIcon = true,
  className,
  variant = 'default',
}: RoleBadgeProps) {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'student':
        return {
          label: 'Student',
          icon: GraduationCap,
          className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300',
        };
      case 'instructor':
        return {
          label: 'Instructor',
          icon: Users,
          className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300',
        };
      case 'admin':
        return {
          label: 'Admin',
          icon: Shield,
          className: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300',
        };
      default:
        return {
          label: role,
          icon: null,
          className: '',
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  if (variant === 'outline') {
    return (
      <Badge variant="outline" className={cn('capitalize', className)}>
        {showIcon && Icon && <Icon className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge className={cn(config.className, 'capitalize', className)}>
      {showIcon && Icon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
