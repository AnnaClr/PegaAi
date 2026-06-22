import { useState, useEffect } from 'react';
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
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>Meus Aluguéis</h1>
        <p className={styles.subtitle}>Lista de produtos que você alugou</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando alugueis...</div>
      ) : rentals.length === 0 ? (
        <div className={styles.empty}>Nenhum aluguel encontrado.</div>
      ) : (
        <div className={styles.grid}>
          {rentals.map((rental, idx) => {
              const product = rental?.product ?? null;
              const productName = product?.name ?? product?.title ?? 'Produto indisponível';
              const image = product?.first_image_url ?? product?.image ?? product?.image_url ?? (product?.images && product.images[0]) ?? 'https://via.placeholder.com/320x220?text=Sem+imagem';
              const startDate = parseDate(rental.start_rental ?? rental.start_date ?? rental.startDate ?? rental.start_at ?? rental.start);
              const endDate = parseDate(rental.end_rental ?? rental.end_date ?? rental.endDate ?? rental.end_at ?? rental.end);
            const daysElapsed = startDate ? Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0;
            const plannedDays = startDate && endDate ? diffDays(startDate, endDate) : null;
            const maxDays = product?.max_days ?? product?.maxDays ?? 0;
            const exceeded = maxDays && daysElapsed > maxDays;
            const key = rental.id ?? rental.rental_id ?? `${rental.product_id ?? 'p'}-${idx}`;

            return (
              <article key={key} className={`${styles.card} ${exceeded ? styles.exceeded : ''}`}>
                <div className={styles.thumb}>
                  <img src={image} alt={productName} />
                </div>
                <div className={styles.info}>
                  <h3 className={styles.productName}>{productName}</h3>
                  <div className={styles.meta}>
                    <span className={styles.category}>{product?.category ?? '—'}</span>
                    <div className={styles.price}>R$ {product ? Number(product.price_per_day ?? product.price ?? 0).toFixed(2) : '—'}<span className={styles.pDay}>/dia</span></div>
                  </div>

                  <div className={styles.dates}>
                    <div><strong>Início:</strong> {startDate ? startDate.toLocaleDateString('pt-BR') : '—'}</div>
                    <div><strong>Fim:</strong> {endDate ? endDate.toLocaleDateString('pt-BR') : '—'}</div>
                    <div><strong>Dias:</strong> {plannedDays ?? (daysElapsed || '—')}</div>
                  </div>

                  <div className={styles.owner}><strong>Proprietário:</strong> {product?.owner ?? product?.owner_name ?? product?.user?.name ?? '—'}</div>

                  {exceeded && <div className={styles.badge}>Excedeu limite de {maxDays} dias</div>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}