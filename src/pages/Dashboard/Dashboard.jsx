import { Link } from "react-router-dom";
import { FaBoxOpen, FaList } from "react-icons/fa";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <p>Gerencie seus produtos e aluguéis</p>
        </div>

        <div className={styles.grid}>
          <Link to="/products/rentals" className={styles.card}>
            <div className={styles.cardIcon}>
              <FaBoxOpen size={32} />
            </div>
            <div className={styles.cardContent}>
              <h3>Produtos Alugados</h3>
              <p>Visualize todos os produtos que você alugou</p>
            </div>
            <span className={styles.cardArrow}>→</span>
          </Link>

          <Link to="/products/my" className={styles.card}>
            <div className={styles.cardIcon}>
              <FaList size={32} />
            </div>
            <div className={styles.cardContent}>
              <h3>Meus Produtos</h3>
              <p>Gerencie os produtos que você cadastrou</p>
            </div>
            <span className={styles.cardArrow}>→</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}