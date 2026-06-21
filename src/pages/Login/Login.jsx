import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
import styles from './login.module.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Dados do login:', formData);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login com ${provider}`);
  };

  return (
    <main className={styles.loginContainer}>
      <section className={styles.loginCard}>
        <header className={styles.loginHeader}>
          <h1>Bem-vindo de volta</h1>
          <p>Faça login para continuar</p>
        </header>

        <form className={styles.loginForm} onSubmit={handleLogin} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          
          <div className={styles.loginOptions}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              Lembrar-me
            </label>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Esqueceu a senha?
            </Link>
          </div>
          
          <button type="submit" className={styles.loginBtn}>
            Entrar
          </button>
          
          <div className={styles.socialLogin}>
            <span>Ou continue com</span>
            <div className={styles.socialIcons}>
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.google}`}
                onClick={() => handleSocialLogin('Google')}
                aria-label="Entrar com Google"
              >
                <FcGoogle size={24} />
              </button>
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.facebook}`}
                onClick={() => handleSocialLogin('Facebook')}
                aria-label="Entrar com Facebook"
              >
                <FaFacebook size={24} color="#1877F2" />
              </button>
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.apple}`}
                onClick={() => handleSocialLogin('Apple')}
                aria-label="Entrar com Apple"
              >
                <FaApple size={24} />
              </button>
            </div>
          </div>
        </form>
        
        <footer className={styles.loginFooter}>
          <p>
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </footer>
      </section>
      
      <aside className={styles.loginImage}>
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=800&fit=crop"
          alt="Pessoas compartilhando objetos"
        />
        <div className={styles.imageOverlay}>
          <h3>Junte-se à comunidade</h3>
          <p>Mais de 100 mil usuários compartilhando objetos</p>
        </div>
      </aside>
    </main>
  );
}