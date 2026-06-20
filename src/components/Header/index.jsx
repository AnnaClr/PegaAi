import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaHeart, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import styles from "./header.module.css";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoPega}>Pega</span>
          <span className={styles.logoAi}>Aí</span>
          <span className={styles.logoPlus}>+</span>
        </Link>

        <button className={styles.mobileMenuBtn} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu mobile">
          <FaBars size={24} />
        </button>

        <nav className={`${styles.navMenu} ${isMobileMenuOpen ? styles.active : ""}`}>
          <Link to="/"><span className={styles.linkText}>Página Inicial</span></Link>
          <Link to="/explorer"><span className={styles.linkText}>Explorar</span></Link>
          <Link to="/favorites"><FaHeart size={20} /></Link>
          <Link to="/cart"><FaShoppingCart size={20} /></Link>
          <Link to="/login" className={styles.entrarBtn}>Entrar</Link>
          <Link to="/perfil" className={styles.profileLink}>
            <div className={styles.profileIcon}>
              <FaUserCircle size={28} />
              <span className={styles.profileBadge}></span>
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}