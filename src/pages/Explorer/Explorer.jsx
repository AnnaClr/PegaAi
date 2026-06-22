import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaUndo,
  FaTimes
} from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import api from '../../utils/axios';
import styles from './explorer.module.css';

const FiltersContent = ({
  categories,
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
        <label key={category.category_id}>
          <input 
            type="checkbox" 
            checked={selectedCategories.includes(Number(category.category_id))}
            onChange={() => handleCategoryChange(Number(category.category_id))}
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
    
    {/* Avaliações removidas do filtro */}
  </>
);

export default function Explorer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const allProducts = useMemo(() => products, [products]);
  
  const categoryParam = searchParams.get('categoria');
  const initialCategoryId = categoryParam ? parseInt(categoryParam) : null;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategoryId ? [initialCategoryId] : []
  );
  const [maxPrice, setMaxPrice] = useState(500);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  const filteredProducts = useMemo(() => {
    let results = [...allProducts];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(product => 
        product.name.toLowerCase().includes(term)
      );
    }

    if (selectedCategories.length > 0) {
      results = results.filter(product => 
        selectedCategories.includes(Number(product.category_id))
      );
    }

    results = results.filter(product => Number(product.price_per_day ?? product.price ?? 0) <= maxPrice);

    // rating filter removed

    switch (sortBy) {
      case 'lowest':
        results.sort((a, b) => a.price_per_day - b.price_per_day);
        break;
      case 'highest':
        results.sort((a, b) => b.price_per_day - a.price_per_day);
        break;
      default:
        break;
    }

    return results;
  }, [allProducts, searchTerm, sortBy, selectedCategories, maxPrice]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [prodResp, catsResp, imgsResp] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/product_images')
        ]);

        if (!mounted) return;

        const prods = prodResp.data ?? [];
        const cats = catsResp.data ?? [];
        const imgs = imgsResp.data ?? [];

        // map images by product_id
        const imgsByProduct = imgs.reduce((acc, im) => {
          const id = im.product_id ?? im.productId ?? im.product_id;
          if (!acc[id]) acc[id] = [];
          acc[id].push(im.image_url ?? im.url ?? im.imageUrl ?? im.image_url);
          return acc;
        }, {});

        const mapped = prods.map(p => {
          const id = p.product_id ?? p.id;
          const productImages = imgsByProduct[id] ?? [];
          const firstImage = productImages[0] ?? null;
          const category = cats.find(c => Number(c.category_id) === Number(p.category_id));
          return {
            ...p,
            images: productImages,
            first_image_url: firstImage,
            image: firstImage ?? p.image ?? p.image_url ?? 'https://via.placeholder.com/320x220?text=Sem+imagem',
            category: category?.name ?? ''
          };
        });

        setProducts(mapped);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load explorer data', err.response?.data || err.message || err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

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
    navigate(`/product/view/${productId}`);
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

  // rating UI/helpers removed

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => Number(c.category_id) === Number(categoryId));
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
                categories={categories}
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
                    {selectedCategories.length > 0 && (
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
                  <ProductCard key={product.product_id} product={product} onRent={handleRent} />
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
                categories={categories}
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
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}