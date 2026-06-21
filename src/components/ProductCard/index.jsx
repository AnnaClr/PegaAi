import { useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import styles from "./productCard.module.css";

export default function ProductCard({ product, onRent }) {
  const navigate = useNavigate();

  const renderStars = (rating) => {
    const starElements = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      starElements.push(
        <FaStar key={`full-${i}`} className={styles.starIcon} />,
      );
    }

    if (hasHalfStar) {
      starElements.push(
        <FaStarHalfAlt key="half" className={styles.starIcon} />,
      );
    }

    const emptyStars = 5 - starElements.length;
    for (let i = 0; i < emptyStars; i++) {
      starElements.push(
        <FaRegStar key={`empty-${i}`} className={styles.starIcon} />,
      );
    }

    return starElements;
  };

  const handleRent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRent) {
      onRent(product.product_id);
    } else {
      navigate(`/alugar/${product.product_id}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.product_id}`);
  };

  return (
    <div className={styles.productCard} onClick={handleCardClick}>
      <div className={styles.productImage}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className={styles.imageOverlay}></div>
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{product.name}</h3>
        <p className={styles.productCategory}>{product.category}</p>
        <div className={styles.productPrice}>
          R$ {product.price_per_day.toFixed(2)} <span>/dia</span>
        </div>
        <div className={styles.productRating}>
          <div className={styles.stars}>{renderStars(product.rating)}</div>
          <span className={styles.ratingText}>
            {product.rating} ({product.reviews} avaliações)
          </span>
        </div>
        <button className={styles.rentBtn} onClick={handleRent}>
          Alugar agora
        </button>
      </div>
    </div>
  );
}