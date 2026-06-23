import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useProfileCheck(redirectTo = '/profile') {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const userData = JSON.parse(raw);
        setUser(userData);
        
        const complete = !!(
          userData.name?.trim() &&
          userData.email?.trim() &&
          userData.cpf?.trim() &&
          userData.phone_number?.trim()
        );
        
        setIsProfileComplete(complete);
        
        if (!complete) {
          navigate(redirectTo, { 
            state: { message: 'Complete seu perfil antes de continuar.' }
          });
        }
      } catch (e) {
        setUser(null);
        setIsProfileComplete(false);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate, redirectTo]);

  return { user, isProfileComplete, loading };
}