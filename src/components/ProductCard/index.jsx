import { useNavigate } from "react-router-dom";
import styles from "./productcard.module.css";

export default function ProductCard({ product, onRent }) {
  const navigate = useNavigate();
  const isAvailable = product?.status?.toLowerCase() === "disponível";

  const handleRent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAvailable) {
      alert(`Este produto não está disponível para aluguel. Status atual: ${product.status}`);
      return;
    }
    
    if (onRent) {
      onRent(product.product_id);
    } else {
      navigate(`/alugar/${product.product_id}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/view/${product.product_id}`);
  };

  return (
    <div className={styles.productCard} onClick={handleCardClick}>
      <div className={styles.productImage}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className={styles.imageOverlay}></div>
        {!isAvailable && (
          <div className={styles.statusBadge}>
            <span>{product.status}</span>
          </div>
        )}
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{product.name}</h3>
        <p className={styles.productCategory}>{product.category}</p>
        <div className={styles.productPrice}>
          R$ {Number(product.price_per_day ?? product.price ?? 0).toFixed(2)} <span>/dia</span>
        </div>
        <button 
          className={`${styles.rentBtn} ${!isAvailable ? styles.rentBtnDisabled : ''}`}
          onClick={handleRent}
          disabled={!isAvailable}
        >
          {isAvailable ? 'Alugar agora' : 'Indisponível'}
        </button>
      </div>
    </div>
  );
}