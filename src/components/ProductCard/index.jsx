import { useNavigate } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import styles from "./productCard.module.css";

export default function ProductCard({ product, onRent }) {
  const navigate = useNavigate();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className={styles.starIcon} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className={styles.starIcon} />);
    }
    while (stars.length < 5) {
      stars.push(<FaRegStar key={stars.length} className={styles.starIcon} />);
    }
    return stars;
  };

  const handleRent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRent) {
      onRent(product.id);
    } else {
      navigate(`/alugar/${product.id}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className={styles.productCard} onClick={handleCardClick}>
      <div className={styles.productImage}>
        <img src={product.image} alt={product.title} loading="lazy" />
        <div className={styles.imageOverlay}></div>
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{product.title}</h3>
        <p className={styles.productCategory}>{product.category}</p>
        <div className={styles.productPrice}>
          R$ {product.price.toFixed(2)} <span>/dia</span>
        </div>
        <div className={styles.productRating}>
          <div className={styles.stars}>{renderStars(product.stars)}</div>
          <span className={styles.ratingText}>
            {product.rating} ({product.reviews} avaliações)
          </span>
        </div>
        <button className={styles.rentBtn} onClick={handleRent}>Alugar agora</button>
      </div>
    </div>
  );
}