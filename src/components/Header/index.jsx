import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import styles from "./header.module.css";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const verifyLogin = () => {
    const user = localStorage.getItem('user');
    return user;
  }

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
          <Link to="/products/rentals"><span className={styles.linkText}>Produtos Alugadoss</span></Link>
          <Link to="/product/up"><span className={styles.linkText}>Cadastrar Produto</span></Link>
          <Link to="/products/my"><span className={styles.linkText}>Meus Produtos</span></Link>
          <Link to="/cart"><FaShoppingCart size={20} /></Link>
          <Link to="/login" className={styles.entrarBtn} style={{display: verifyLogin()? 'none' : ''}} >Entrar</Link>
          <Link to="/profile" className={styles.profileLink} style={{display: verifyLogin()? '' : 'none'}}>
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