import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import styles from '../Login/login.module.css';

export default function Profile() {
  const [formData, setFormData] = useState({
    user_id: null,
    name: '',
    email: '',
    phone_number: '',
    cpf: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const localUser = JSON.parse(raw);
        // defer state update to avoid synchronous setState inside effect
        Promise.resolve().then(() => {
          setFormData((f) => ({
            ...f,
            user_id: localUser.user_id ?? null,
            name: localUser.name ?? '',
            email: localUser.email ?? '',
            phone_number: localUser.phone_number ?? '',
            cpf: localUser.cpf ?? ''
          }));
        });
      } catch (e) {
        console.error('failed parse user', e);
      }
    }
    Promise.resolve().then(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setSuccess('');
  };


  const validate = () => {
    const errs = {};
    if (!formData.name || formData.name.trim().length < 2) errs.name = 'Nome é obrigatório';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'E-mail inválido';
    const cpfDigits = (formData.cpf || '').replace(/\D/g, '');
    if (!cpfDigits || cpfDigits.length !== 11) errs.cpf = 'CPF inválido (11 dígitos)';
    if (formData.password) {
      if (formData.password.length < 6) errs.password = 'Senha precisa ter ao menos 6 caracteres';
      if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'As senhas não conferem';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!formData.user_id) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const updatedUser = {
        user_id: formData.user_id,
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        cpf: formData.cpf
      };
      if (formData.password) updatedUser.password = formData.password;
        await api.patch(`/users?user_id=eq.${formData.user_id}`, updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setFormData((s) => ({ ...s, password: '', confirmPassword: '' }));
        setSuccess('Perfil atualizado com sucesso.');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
        setErrors({ submit: 'Falha ao atualizar perfil. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };
  return (
    <main className={styles.loginContainer}>
      <section className={styles.loginCard}>
        <header className={styles.loginHeader}>
          <h1>Editar perfil</h1>
          <p>Atualize suas informações de conta</p>
        </header>

        <form className={styles.loginForm} onSubmit={onSubmit} noValidate>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="name">Nome</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} />
                {errors.name && <small style={{ color: 'crimson' }}>{errors.name}</small>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                {errors.email && <small style={{ color: 'crimson' }}>{errors.email}</small>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone_number">Telefone</label>
                <input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="Somente números" />
                {errors.cpf && <small style={{ color: 'crimson' }}>{errors.cpf}</small>}
              </div>

              {/* Avatar removed: profile edits do not include avatar upload */}

              <div className={styles.inputGroup}>
                <label htmlFor="password">Nova senha (opcional)</label>
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
                {errors.password && <small style={{ color: 'crimson' }}>{errors.password}</small>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirme a senha</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <small style={{ color: 'crimson' }}>{errors.confirmPassword}</small>}
              </div>

              {errors.submit && <div style={{ color: 'crimson' }}>{errors.submit}</div>}
              {success && <div style={{ color: 'green' }}>{success}</div>}

              <button type="submit" className={styles.loginBtn} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>

              <div className={styles.loginFooter}>
                <p>
                  Quer sair? <Link to="/">Voltar</Link>
                </p>
              </div>
            </>
          )}
        </form>
      </section>

      <aside className={styles.loginImage}>
        <img
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1000&fit=crop"
          alt="Perfil"
        />
        <div className={styles.imageOverlay}>
          <h3>Seu perfil</h3>
          <p>Atualize seus dados para manter seu perfil visível para a comunidade</p>
        </div>
      </aside>
    </main>
  );
}
