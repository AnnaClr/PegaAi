import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { FaCalendarAlt, FaUser, FaClock, FaExclamationTriangle, FaBoxOpen } from 'react-icons/fa';
import { getRentalsByUserId } from './ProductsRentals.helpers';
import styles from './productsrentals.module.css';

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function diffDays(a, b) {
  if (!a || !b) return null;
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function formatDate(date) {
  if (!date) return '—';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getStatus(startDate, endDate, maxDays) {
  const now = new Date();
  if (!startDate) return { label: 'Pendente', type: 'pending' };
  
  const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  if (endDate && now > endDate) {
    return { label: 'Finalizado', type: 'completed' };
  }
  
  if (maxDays && daysElapsed > maxDays) {
    return { label: 'Excedido', type: 'exceeded' };
  }
  
  if (daysElapsed <= 0) {
    return { label: 'Agendado', type: 'scheduled' };
  }
  
  return { label: 'Em andamento', type: 'active' };
}

export default function ProductsRentals() {
  const [rentals, setRentals] = useState([]);   
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchRentals = async () => {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      const userIdFromLocal = localStorage.getItem('userId');
      let userId = null;
      if (userIdFromLocal) userId = userIdFromLocal;
      else if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userId = parsed?.user_id ?? parsed?.id ?? parsed?.userId ?? null;
        } catch (err) {
          console.error('Erro ao parsear usuário do localStorage', err);
          userId = null;
        }
      }
      if (!userId) {
        setRentals([]);
        setLoading(false);
        return;
      }
      const rentalsData = await getRentalsByUserId(userId);
      if (!mounted) return;
      setRentals(rentalsData || []);
      setLoading(false);
    };

    fetchRentals();
    return () => { mounted = false; };
  }, []);

  const now = new Date();

  return (
    <>
      <Header />
      <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Meus Aluguéis</h1>
          <p className={styles.subtitle}>Acompanhe todos os produtos que você alugou</p>
        </div>
        <div className={styles.headerStats}>
          <span className={styles.statItem}>
            <span className={styles.statValue}>{rentals.length}</span>
            <span className={styles.statLabel}>Total</span>
          </span>
          <span className={styles.statItem}>
            <span className={styles.statValue}>
              {rentals.filter(r => {
                const start = parseDate(r.start_rental ?? r.start_date ?? r.startDate);
                if (!start) return false;
                const daysElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
                const maxDays = r.product?.max_days ?? 0;
                return daysElapsed > 0 && daysElapsed <= maxDays;
              }).length}
            </span>
            <span className={styles.statLabel}>Ativos</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Carregando seus aluguéis...</p>
        </div>
      ) : rentals.length === 0 ? (
        <div className={styles.empty}>
          <FaBoxOpen className={styles.emptyIcon} />
          <h3>Nenhum aluguel encontrado</h3>
          <p>Você ainda não alugou nenhum produto.</p>
          <Link to="/explorer" className={styles.emptyBtn}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {rentals.map((rental, idx) => {
            const product = rental?.product ?? null;
            const productName = product?.name ?? product?.title ?? 'Produto indisponível';
            const image = product?.first_image_url ?? 
                          product?.image ?? 
                          product?.image_url ?? 
                          (product?.images && product.images[0]) ?? 
                          'https://via.placeholder.com/320x220?text=Sem+imagem';
            
            const startDate = parseDate(rental.start_rental ?? rental.start_date ?? rental.startDate ?? rental.start_at ?? rental.start);
            const endDate = parseDate(rental.end_rental ?? rental.end_date ?? rental.endDate ?? rental.end_at ?? rental.end);
            const daysElapsed = startDate ? Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0;
            const plannedDays = startDate && endDate ? diffDays(startDate, endDate) : null;
            const maxDays = product?.max_days ?? product?.maxDays ?? 0;
            const key = rental.id ?? rental.rental_id ?? `${rental.product_id ?? 'p'}-${idx}`;
            
            const status = getStatus(startDate, endDate, maxDays);
            const isActive = status.type === 'active' || status.type === 'scheduled';
            const isCompleted = status.type === 'completed';
            const isExceeded = status.type === 'exceeded';

            return (
              <article key={key} className={`${styles.card} ${isExceeded ? styles.exceeded : ''} ${isCompleted ? styles.completed : ''}`}>
                <div className={styles.thumb}>
                  <img src={image} alt={productName} />
                  <div className={`${styles.statusBadge} ${styles[status.type]}`}>
                    {status.label}
                  </div>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.productName}>{productName}</h3>
                  
                  <div className={styles.meta}>
                    <span className={styles.category}>{product?.category ?? '—'}</span>
                    <div className={styles.price}>
                      R$ {product ? Number(product.price_per_day ?? product.price ?? 0).toFixed(2) : '—'}
                      <span className={styles.pDay}>/dia</span>
                    </div>
                  </div>

                  <div className={styles.dates}>
                    <div className={styles.dateItem}>
                      <FaCalendarAlt className={styles.dateIcon} />
                      <span><strong>Início:</strong> {formatDate(startDate)}</span>
                    </div>
                    <div className={styles.dateItem}>
                      <FaCalendarAlt className={styles.dateIcon} />
                      <span><strong>Fim:</strong> {formatDate(endDate)}</span>
                    </div>
                    <div className={styles.dateItem}>
                      <FaClock className={styles.dateIcon} />
                      <span><strong>Dias:</strong> {plannedDays ?? (daysElapsed || '—')}</span>
                    </div>
                  </div>

                  <div className={styles.owner}>
                    <FaUser className={styles.ownerIcon} />
                    <strong>Proprietário:</strong> {product?.owner ?? product?.owner_name ?? product?.user?.name ?? '—'}
                  </div>

                  {isExceeded && (
                    <div className={styles.badge}>
                      <FaExclamationTriangle className={styles.badgeIcon} />
                      Excedeu limite de {maxDays} dias
                    </div>
                  )}

                  {isActive && maxDays > 0 && !isExceeded && (
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ 
                          width: `${Math.min((daysElapsed / maxDays) * 100, 100)}%` 
                        }}
                      />
                      <span className={styles.progressText}>
                        {daysElapsed} de {maxDays} dias
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
    <Footer />
    </>
  );
}