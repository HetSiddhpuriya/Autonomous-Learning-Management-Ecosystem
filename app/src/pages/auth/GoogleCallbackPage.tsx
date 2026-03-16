import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('lms_token', token);

      // Fetch the user profile and redirect
      api.get('/auth/me')
        .then(({ data }) => {
          const user = data.user;
          // Redirect based on role
          switch (user.role) {
            case 'student':
              navigate('/student');
              break;
            case 'instructor':
              navigate('/instructor');
              break;
            case 'admin':
              navigate('/admin');
              break;
            default:
              navigate('/student');
          }
          // Force page reload to update auth context
          window.location.reload();
        })
        .catch(() => {
          localStorage.removeItem('lms_token');
          navigate('/login?error=google_auth_failed');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground text-lg">Signing you in with Google...</p>
      </div>
    </div>
  );
}
