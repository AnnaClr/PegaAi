import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import Carousel from '../../components/Carousel';
import { categories, featuredProducts, recommendedProducts } from '../../data/mockData';
import styles from './home.module.css';

export default function Home() {
  const navigate = useNavigate();

  const handleRent = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAnnounce = () => {
    navigate('/announce');
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/explorar?categoria=${categoryId}`);
  };

  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  <span className={styles.highlight}>Alugue</span> o que você precisa,<br />
                  <span className={styles.highlight}>compartilhe</span> o que você tem
                </h1>
                <p className={styles.heroDescription}>
                  Junte-se à maior comunidade de compartilhamento de objetos do Brasil. 
                  Economize, ganhe dinheiro e ajude o planeta.
                </p>
                
                <div className={styles.heroStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>50k+</span>
                    <span className={styles.statLabel}>Objetos disponíveis</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>100k+</span>
                    <span className={styles.statLabel}>Usuários cadastrados</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>98%</span>
                    <span className={styles.statLabel}>Clientes satisfeitos</span>
                  </div>
                </div>
                
                <button className={styles.heroAnnounceBtn} onClick={handleAnnounce}>
                  Anunciar agora
                </button>
              </div>

              <div className={styles.heroImage}>
                <img 
                  src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=500&fit=crop" 
                  alt="Pessoa usando ferramentas alugadas"/>
                <div className={`${styles.heroCard} ${styles.floatingCard} ${styles.card1}`}>
                  <i className="fas fa-camera"></i>
                  <div>
                    <strong>Câmera Profissional</strong>
                    <span>R$ 89/dia</span>
                  </div>
                </div>
                <div className={`${styles.heroCard} ${styles.floatingCard} ${styles.card2}`}>
                  <i className="fas fa-tools"></i>
                  <div>
                    <strong>Kit Ferramentas</strong>
                    <span>R$ 35/dia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.categories}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>Explore por categoria</h2>
              <p>Encontre exatamente o que você precisa em nossas categorias especializadas</p>
            </div>
            <div className={styles.categoriesGrid}>
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className={styles.categoryCard}
                  onClick={() => handleCategoryClick(category.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(category.id)}
                >
                  <div className={styles.categoryImage}>
                    <img src={category.image} alt={category.name} loading="lazy" />
                    <div className={styles.categoryOverlay}>
                      <i className={category.icon}></i>
                      <h3>{category.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.featured}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>Objetos em oferta</h2>
              <p>Os produtos mais populares com preços imperdíveis</p>
            </div>
            <Carousel>
              {featuredProducts.map(product => (
                <ProductCard key={product.product_id} product={product} onRent={handleRent} />
              ))}
            </Carousel>
          </div>
        </section>

        <section className={styles.recommended}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>Recomendados para você</h2>
              <p>Baseado nos seus interesses e localização</p>
            </div>
            <Carousel>
              {recommendedProducts.map(product => (
                <ProductCard key={product.product_id} product={product} onRent={handleRent} />
              ))}
            </Carousel>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}