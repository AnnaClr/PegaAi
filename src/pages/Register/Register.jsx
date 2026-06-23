import { useState } from 'react';
import api from '../../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
import styles from './register.module.css';

export default function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    cpf: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login com ${provider}`);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users', {
        name: formData.fullname,
        cpf: formData.cpf,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
      });
      if (response.status === 201 || response.status === 200) {
        const loginData = await api.get(`/users?email=eq.${formData.email}&password=eq.${formData.password}`);
        localStorage.setItem('user', JSON.stringify(loginData.data[0]));
        navigate('/explorer');
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error.response?.data || error.message);
    }
  }

  return (
    <main className={styles.registerContainer}>
      <section className={styles.registerCard}>
        <header className={styles.registerHeader}>
          <h1>Crie sua conta</h1>
          <p>Comece a compartilhar e alugar objetos</p>
        </header>

        <form className={styles.registerForm} onSubmit={handleRegister} noValidate>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="fullname">Nome completo</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                placeholder="João Silva"
                value={formData.fuullname}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="cpf">
                CPF <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
          </div>

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
            <label htmlFor="phone">
              Telefone <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone_number}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>
          
          <div className={styles.terms}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              Eu concordo com os<a href="#">Termos de uso</a>e<a href="#">Política de privacidade</a>
            </label>
          </div>
          
          <button type="submit" className={styles.registerBtn} onClick={onSubmit} >
            Criar conta gratuita
          </button>
          
          <div className={styles.socialRegister}>
            <span>Ou cadastre-se com</span>
            <div className={styles.socialIcons}>
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.google}`}
                onClick={() => handleSocialLogin('Google')}
                aria-label="Cadastrar com Google"
              >
                <FcGoogle size={24} />
              </button>
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.facebook}`}
                onClick={() => handleSocialLogin('Facebook')}
                aria-label="Cadastrar com Facebook"
              >
                <FaFacebook size={24} color="#1877F2" />
              </button>
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.apple}`}
                onClick={() => handleSocialLogin('Apple')}
                aria-label="Cadastrar com Apple"
              >
                <FaApple size={24} />
              </button>
            </div>
          </div>
        </form>
        
        <footer className={styles.registerFooter}>
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </footer>
      </section>
      
      <aside className={styles.registerImage}>
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