import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme';
import styles from './themeToggle.module.css';

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button 
      className={styles.themeToggle} 
      onClick={toggleTheme}
      aria-label="Alternar tema"
    >
      {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
    </button>
  );
}