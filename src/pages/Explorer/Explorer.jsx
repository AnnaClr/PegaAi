import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaRegStar,
  FaUndo,
  FaStarHalfAlt,
  FaTimes
} from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { categories, featuredProducts, recommendedProducts } from '../../data/mockData';
import styles from './explorer.module.css';

const FiltersContent = ({
  selectedCategories,
  handleCategoryChange,
  clearFilters,
  isMobile,
  setShowFilters,
  sliderRef,
  handleSliderStart,
  handleSliderMove,
  handleSliderEnd,
  maxPrice,
  percentage,
  minRating,
  handleRatingClick,
  renderStars,
}) => (
  <>
    <div className={styles.filtersHeader}>
      <h3>
        <FaFilter className={styles.filterIcon} />
        Filtros
      </h3>
      <div className={styles.headerActions}>
        <button onClick={clearFilters} className={styles.clearFiltersBtn}>
          <FaUndo />
          Limpar
        </button>
        {isMobile && (
          <button onClick={() => setShowFilters(false)} className={styles.closeFiltersBtn}>
            <FaTimes />
          </button>
        )}
      </div>
    </div>
    
    <div className={styles.filterSection}>
      <h4>Categorias</h4>
      {categories.map(category => (
        <label key={category.id}>
          <input 
            type="checkbox" 
            checked={selectedCategories.includes(category.id)}
            onChange={() => handleCategoryChange(category.id)}
          />
          {category.name}
        </label>
      ))}
    </div>
    
    <div className={styles.filterSection}>
      <h4>Preço por dia</h4>
      <div className={styles.priceDisplay}>
        <span>R$ 0</span>
        <span>R$ {maxPrice}</span>
      </div>
      <div 
        className={styles.sliderWrapper}
        ref={sliderRef}
        onMouseDown={handleSliderStart}
        onMouseMove={handleSliderMove}
        onMouseUp={handleSliderEnd}
        onMouseLeave={handleSliderEnd}
        onTouchStart={handleSliderStart}
        onTouchMove={handleSliderMove}
        onTouchEnd={handleSliderEnd}
      >
        <div className={styles.sliderTrack}>
          <div 
            className={styles.sliderFill} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div 
          className={styles.sliderThumb}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
    
    <div className={styles.filterSection}>
      <h4>Avaliação</h4>
      <div className={styles.ratingFilter}>
        <div 
          className={`${styles.ratingOption} ${minRating === 4 ? styles.active : ''}`}
          onClick={() => handleRatingClick(4)}
        >
          {renderStars(4, true)} <span>4+ estrelas</span>
        </div>
      </div>
    </div>
  </>
);

export default function Explorer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  const allProducts = useMemo(() => [...featuredProducts, ...recommendedProducts], []);
  const initialCategoryId = searchParams.get('categoria')
    ? categories.find(c => c.id === parseInt(searchParams.get('categoria')))?.id
    : null;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategoryId ? [initialCategoryId] : []
  );
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState(4);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  const filteredProducts = useMemo(() => {
    let results = [...allProducts];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(product => 
        product.title.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    if (selectedCategories.length > 0) {
      results = results.filter(product => 
        selectedCategories.includes(
          categories.find(c => c.name === product.category)?.id
        )
      );
    }

    results = results.filter(product => product.price <= maxPrice);

    if (minRating > 0) {
      results = results.filter(product => product.rating >= minRating);
    }

    switch (sortBy) {
      case 'lowest':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'highest':
        results.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return results;
  }, [allProducts, searchTerm, sortBy, selectedCategories, maxPrice, minRating]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) {
        setShowFilters(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleRent = (productId) => {
    navigate(`/produto/${productId}`);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('relevance');
    setSelectedCategories([]);
    setMaxPrice(500);
    setMinRating(4);
  };

  const handleRatingClick = (rating) => {
    setMinRating(rating);
  };

  const handleSliderStart = (e) => {
    isDraggingRef.current = true;
    handleSliderMove(e);
  };

  const handleSliderMove = (e) => {
    if (!isDraggingRef.current && e.type !== 'click') return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.min(Math.max(x / width, 0), 1);
    const value = Math.round(percentage * 500 / 5) * 5;
    setMaxPrice(value);
  };

  const handleSliderEnd = () => {
    isDraggingRef.current = false;
  };

  const renderStars = (count, interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(count);
    const hasHalfStar = count % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={interactive ? styles.starInteractive : styles.starIcon} 
          onClick={interactive ? () => handleRatingClick(count) : undefined}
        />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt 
          key="half" 
          className={interactive ? styles.starInteractive : styles.starIcon}
          onClick={interactive ? () => handleRatingClick(count) : undefined}
        />
      );
    }
    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(
        <FaRegStar 
          key={`empty-${i}`} 
          className={interactive ? styles.starInteractive : styles.starIcon}
          onClick={interactive ? () => handleRatingClick(count) : undefined}
        />
      );
    }
    return stars;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  const percentage = (maxPrice / 500) * 100;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.productsContainer}>
          {!isMobile && (
            <aside className={styles.filtersSidebar}>
              <FiltersContent
                selectedCategories={selectedCategories}
                handleCategoryChange={handleCategoryChange}
                clearFilters={clearFilters}
                isMobile={isMobile}
                setShowFilters={setShowFilters}
                sliderRef={sliderRef}
                handleSliderStart={handleSliderStart}
                handleSliderMove={handleSliderMove}
                handleSliderEnd={handleSliderEnd}
                maxPrice={maxPrice}
                percentage={percentage}
                minRating={minRating}
                handleRatingClick={handleRatingClick}
                renderStars={renderStars}
              />
            </aside>
          )}
          
          <div className={styles.productsContent}>
            <div className={styles.productsHeader}>
              <div className={styles.searchBar}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="text" 
                    placeholder="Buscar produtos, categorias ou marcas"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className={styles.searchBtn}>
                    <FaSearch />
                  </button>
                </form>
              </div>
              <div className={styles.headerControls}>
                {isMobile && (
                  <button 
                    className={styles.filterToggleBtn}
                    onClick={() => setShowFilters(true)}
                  >
                    <FaFilter />
                    <span>Filtros</span>
                    {(selectedCategories.length > 0) && (
                      <span className={styles.filterBadge}>
                        {selectedCategories.length}
                      </span>
                    )}
                  </button>
                )}
                <div className={styles.sortOptions}>
                  <label>Ordenar por:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="relevance">Mais relevantes</option>
                    <option value="lowest">Menor preço</option>
                    <option value="highest">Maior preço</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className={styles.resultsInfo}>
              <span>{filteredProducts.length} produtos encontrados</span>
              {selectedCategories.length > 0 && (
                <div className={styles.activeFilters}>
                  {selectedCategories.map(id => (
                    <span key={id} className={styles.filterTag}>
                      {getCategoryName(id)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className={styles.productsGrid}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onRent={handleRent} />
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>Nenhum produto encontrado</p>
                  <button onClick={clearFilters} className={styles.clearFiltersBtn}>
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isMobile && showFilters && (
          <div className={styles.filtersOverlay} onClick={() => setShowFilters(false)}>
            <div className={styles.filtersModal} onClick={(e) => e.stopPropagation()}>
              <FiltersContent
                selectedCategories={selectedCategories}
                handleCategoryChange={handleCategoryChange}
                clearFilters={clearFilters}
                isMobile={isMobile}
                setShowFilters={setShowFilters}
                sliderRef={sliderRef}
                handleSliderStart={handleSliderStart}
                handleSliderMove={handleSliderMove}
                handleSliderEnd={handleSliderEnd}
                maxPrice={maxPrice}
                percentage={percentage}
                minRating={minRating}
                handleRatingClick={handleRatingClick}
                renderStars={renderStars}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}