import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaShoppingCart,
  FaUserCircle,
  FaUserPlus,
} from "react-icons/fa";
import ThemeToggle from "../ThemeToggle";
import styles from "./header.module.css";

export default function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsLoggedIn(true);
        } catch (e) {
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === "user") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoPega}>Pega</span>
          <span className={styles.logoAi}>Aí</span>
          <span className={styles.logoPlus}>+</span>
        </Link>

        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu mobile">
          <FaBars size={24} />
        </button>

        <nav
          className={`${styles.navMenu} ${isMobileMenuOpen ? styles.active : ""}`}>
          <Link
            to="/"
            className={`${styles.link} ${isActive("/") ? styles.active : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}>
            Página Inicial
          </Link>
          <Link
            to="/explorer"
            className={`${styles.link} ${isActive("/explorer") ? styles.active : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}>
            Explorar
          </Link>

          {isLoggedIn && (
            <>
              <Link
                to="/dashboard"
                className={`${styles.link} ${isActive("/dashboard") ? styles.active : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
            </>
          )}

          <ThemeToggle />

          <Link
            to="/cart"
            className={`${styles.cartLink} ${isActive("/cart") ? styles.active : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}>
            <FaShoppingCart size={20} />
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className={styles.profileLink}
                onClick={() => setIsMobileMenuOpen(false)}>
                <div className={styles.profileIcon}>
                  <FaUserCircle size={28} />
                  <span className={styles.profileBadge}></span>
                </div>
              </Link>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link
                to="/register"
                className={styles.registerBtn}
                onClick={() => setIsMobileMenuOpen(false)}>
                <FaUserPlus size={16} />
                Cadastrar
              </Link>
              <Link
                to="/login"
                className={styles.entrarBtn}
                onClick={() => setIsMobileMenuOpen(false)}>Entrar
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}