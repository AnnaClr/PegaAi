import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getProductImages } from './ViewProduct.helpers';
import SimpleImageSlider from 'react-simple-image-slider';
import './ViewProduct.css';

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    if (localStorage.getItem('user')) {
      const userData = JSON.parse(localStorage.getItem('user'));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(userData);
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getProduct(id);
        const imgs = await getProductImages(id);
        if (!mounted) return;
        setProduct(p);
        setImages(imgs || []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('Erro ao carregar produto.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    try {
      const raw = localStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      const exists = cart.find(item => Number(item.product_id) === Number(product.product_id));
      if (exists) {
        // already in cart, go to cart
        navigate('/cart');
        return;
      }
      const newItem = {
        id: Date.now(),
        product_id: product.product_id,
        startDate: '',
        endDate: '',
        days: 0
      };
      cart.push(newItem);
      localStorage.setItem('cart', JSON.stringify(cart));
      navigate('/cart');
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho', err);
    }
  };

  const requestRent = () => {
    if (!product) return;
    const item = {
      id: Date.now(),
      product_id: product.product_id,
      startDate: '',
      endDate: '',
      days: 0
    };
    navigate('/checkout', { state: { cartItems: [item], paymentMethod: 'card' } });
  };

  return (
    <main className="view-product">
      {loading ? (
        <div className="skeleton">Carregando produto...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : product ? (
        <div className="view-product__container">
          <div className="view-product__gallery">
            {images.length > 0 ? (
              <div className="slider-card">
                <SimpleImageSlider
                  images={images.map((img) => img.image_url)}
                  width={500}
                  height={385}
                  showBullets={true}
                  showNavs={true}
                />
              </div>
            ) : (
              <div className="no-image">Sem imagem</div>
            )}
          </div>

          <aside className="view-product__details">
            <div className="details-card">
              <h2 className="product-name">{product.name}</h2>
              <div className="product-meta">
                <span className="category">{product.category ?? 'Categoria indisponível'}</span>
                {product.status && (
                  (() => {
                    const s = (product.status || '').toLowerCase();
                    let statusClass = '';
                    if (s.includes('dispon')) statusClass = 'status--available';
                    else if (s.includes('alug')) statusClass = 'status--rented';
                    else if (s.includes('venc')) statusClass = 'status--expired';
                    else if (s.includes('fora') || s.includes('serv')) statusClass = 'status--outofservice';
                    return (
                      <span className={`status ${statusClass}`}>{product.status}</span>
                    );
                  })()
                )}
              </div>
              <h4>Descrição</h4>
              <p className="description">{product.description}</p>
              <div className="purchase-row">
                <div className="price">R$ {product.price_per_day ?? '—'}<span className='p-day'>  /dia</span></div>
                <div className="actions">
                  <button className="btn btn-primary" onClick={requestRent}>Solicitar aluguel</button>
                  <button className="btn btn-outline" onClick={addToCart}>Adicionar ao carrinho</button>
                </div>
              </div>
            </div>

            <div className="seller-card">
              <h4>Locador</h4>
              <p>{user?.name ?? '—'}</p>
              <p>{user?.email ?? ''}</p>
              <p>{user?.phone_number ?? ''}</p>
            </div>
          </aside>
        </div>
      ) : (
        <p>Product not found.</p>
      )}
    </main>
  );
}