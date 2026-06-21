import  { useRef, useState, useEffect } from 'react';
import styles from './carousel.module.css';

export default function Carousel({ children }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, []);

  return (
    <div className={styles.carouselSection}>
      <div className={styles.carouselControls}>
        {showLeftArrow && (
          <button 
            className={`${styles.arrowBtn} ${styles.leftArrow}`}
            onClick={() => scroll('left')}
            aria-label="Ver anteriores"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        )}
        {showRightArrow && (
          <button 
            className={`${styles.arrowBtn} ${styles.rightArrow}`}
            onClick={() => scroll('right')}
            aria-label="Ver mais"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        )}
      </div>
      
      <div 
        className={`${styles.carouselContainer} ${isDragging ? styles.dragging : ''}`}
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className={styles.carouselTrack}>
          {children}
        </div>
      </div>
    </div>
  );
}