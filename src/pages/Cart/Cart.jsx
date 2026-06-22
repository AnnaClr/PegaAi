import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCreditCard,
  FaBarcode,
  FaLock,
  FaTruck,
  FaShieldAlt,
  FaQrcode,
  FaCalendarAlt,
  FaTimes
} from 'react-icons/fa';
import { SiMercadopago, SiPicpay } from 'react-icons/si';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/axios';
import styles from './cart.module.css';

export default function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Erro ao ler carrinho do localStorage', err);
      return [];
    }
  });

  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [periodErrors, setPeriodErrors] = useState({});

  const getProductById = (productId) => {
    return products.find(p => Number(p.product_id) === Number(productId));
  };

  const getCategoryName = (categoryId) => {
    const category = categoriesList.find(c => Number(c.category_id) === Number(categoryId));
    return category ? category.name : '';
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    const newErrors = { ...periodErrors };
    delete newErrors[id];
    setPeriodErrors(newErrors);
  };

  const handleDateChange = (itemId, field, value) => {
    setCartItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      const updatedItem = { ...item, [field]: value };
      
      if (updatedItem.startDate && updatedItem.endDate) {
        const start = new Date(updatedItem.startDate);
        const end = new Date(updatedItem.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          setPeriodErrors(prev => ({ ...prev, [itemId]: 'Selecione pelo menos 1 dia' }));
          return { ...updatedItem, days: 0 };
        }
        
        const product = getProductById(updatedItem.product_id);
        if (product && diffDays > product.max_days) {
          setPeriodErrors(prev => ({ ...prev, [itemId]: `Máximo de ${product.max_days} dias` }));
          return { ...updatedItem, days: 0 };
        }
        
        setPeriodErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[itemId];
          return newErrors;
        });
        return { ...updatedItem, days: diffDays };
      }
      
      return updatedItem;
    }));
  };

  const handleCheckout = () => {
    const validItems = cartItems.filter(item => item.days > 0);
    if (validItems.length === 0) {
      alert('Selecione o período de locação para todos os itens');
      return;
    }
    
    navigate('/checkout', {
      state: {
        paymentMethod: paymentMethod,
        cartItems: cartItems
      }
    });
  };

  const cartItemsWithDetails = cartItems.map(item => {
    const product = getProductById(item.product_id);
    const price = Number(product?.price_per_day ?? product?.price ?? 0);
    return {
      ...item,
      ...product,
      total: price * (item.days || 0)
    };
  });

  const totalItems = cartItems.length;
  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // persist cart to localStorage
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Falha ao salvar o carrinho', err);
    }
  }, [cartItems]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const ids = cartItems.map(i => i.product_id).filter(Boolean);
        // always fetch categories
        const catsPromise = api.get('/categories');

        if (ids.length > 0) {
          // fetch products and images for these ids
          const [prodResp, imgsResp, catsResp] = await Promise.all([
            api.get(`/products?product_id=in.(${ids.join(',')})`),
            api.get(`/product_images?product_id=in.(${ids.join(',')})`),
            catsPromise
          ]);
          if (!mounted) return;

          const prods = prodResp.data || [];
          const imgs = imgsResp.data || [];

          // map images by product_id and pick first image_url
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
            return {
              ...p,
              images: productImages,
              first_image_url: firstImage,
              image: firstImage ?? p.image ?? p.image_url ?? 'https://via.placeholder.com/320x220?text=Sem+imagem'
            };
          });

          setProducts(mapped);

          if (!mounted) return;
          setCategoriesList(catsResp.data || []);
        } else {
          const catsResp = await catsPromise;
          if (!mounted) return;
          setProducts([]);
          setCategoriesList(catsResp.data || []);
        }
      } catch (err) {
        console.error('Erro ao carregar produtos do carrinho', err.response?.data || err.message || err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [cartItems]);

  return (
    <>
      <Header />
      <main className={styles.cart}>
        <div className={styles.container}>
          <div className={styles.cartHeader}>
            <div>
              <h1>Meu carrinho</h1>
              <p className={styles.cartSubtitle}>Selecione o período de locação para cada item</p>
            </div>
            <div className={styles.headerActions}>
              <span className={styles.itemCount}>{totalItems} itens</span>
            </div>
          </div>

          <div className={styles.cartGrid}>
            <div className={styles.cartItems}>
              {cartItemsWithDetails.length > 0 ? (
                cartItemsWithDetails.map(item => {
                  const product = getProductById(item.product_id);
                  if (!product) return null;
                  
                  return (
                    <div key={item.id} className={styles.cartItem}>
                      <button className={styles.removeBtn} onClick={() => handleRemoveItem(item.id)}><FaTimes /></button>
                      
                      <div className={styles.itemContent}>
                        <div className={styles.itemLeft}>
                          <div className={styles.itemImage}>
                            <img src={product.image} alt={product.name} />
                            <div className={styles.itemBadge}>Máx. {product.max_days} dias</div>
                          </div>
                          
                          <div className={styles.itemDetails}>
                            <h3>{product.name}</h3>
                            <p className={styles.itemCategory}>{getCategoryName(product.category_id)}</p>
                            <div className={styles.itemPriceInfo}>
                              <span className={styles.itemPrice}>R$ {Number(product.price_per_day ?? product.price ?? 0).toFixed(2)} / dia</span>
                              {item.days > 0 && (
                                <span className={styles.itemTotalPrice}>R$ {item.total.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={styles.itemRight}>
                          <div className={styles.itemPeriod}>
                            <div className={styles.periodHeader}>
                              <FaCalendarAlt className={styles.calendarIcon} />
                              <label>Período</label>
                            </div>
                            <div className={styles.periodInputs}>
                              <input
                                type="date"
                                value={item.startDate}
                                onChange={(e) => handleDateChange(item.id, 'startDate', e.target.value)}
                                min={today}
                                className={periodErrors[item.id] ? styles.error : ''}
                                placeholder="Início"
                              />
                              <input
                                type="date"
                                value={item.endDate}
                                onChange={(e) => handleDateChange(item.id, 'endDate', e.target.value)}
                                min={item.startDate || today}
                                className={periodErrors[item.id] ? styles.error : ''}
                                placeholder="Fim"
                              />
                            </div>
                            {periodErrors[item.id] && (
                              <span className={styles.errorMessage}>{periodErrors[item.id]}</span>
                            )}
                            {item.days > 0 && !periodErrors[item.id] && (
                              <div className={styles.periodSummary}>
                                <span>{item.days} {item.days === 1 ? 'dia' : 'dias'}</span>
                                <span className={styles.periodTotal}>R$ {item.total.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyCart}>
                  <h3>Seu carrinho está vazio</h3>
                  <p>Parece que você ainda não adicionou nenhum item ao carrinho.</p>
                  <Link to="/explorer" className={styles.btnContinue}>
                    Continuar comprando
                  </Link>
                </div>
              )}
            </div>

            <div className={styles.cartSummary}>
              <h3>Resumo do pedido</h3>
              
              <div className={styles.summaryItems}>
                <div className={styles.summaryRow}>
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryTotal}>
                <span>Valor final</span>
                <strong>{formatCurrency(total)}</strong>
              </div>

              <div className={styles.paymentSection}>
                <h4>Forma de pagamento</h4>
                <div className={styles.paymentOptions}>
                  <button 
                    className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('card')}>
                    <FaCreditCard />
                    <span>Cartão</span>
                  </button>
                  <button 
                    className={`${styles.paymentOption} ${paymentMethod === 'pix' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('pix')}>
                    <FaQrcode />
                    <span>PIX</span>
                  </button>
                  <button 
                    className={`${styles.paymentOption} ${paymentMethod === 'boleto' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('boleto')}>
                    <FaBarcode />
                    <span>Boleto</span>
                  </button>
                  <button 
                    className={`${styles.paymentOption} ${paymentMethod === 'mercado' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('mercado')}>
                    <SiMercadopago />
                    <span>Mercado Pago</span>
                  </button>
                  <button 
                    className={`${styles.paymentOption} ${paymentMethod === 'picpay' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('picpay')}>
                    <SiPicpay />
                    <span>PicPay</span>
                  </button>
                </div>

                <div className={styles.paymentCards}>
                  <FaCreditCard className={styles.cardIcon} />
                  <FaCreditCard className={styles.cardIcon} />
                  <FaCreditCard className={styles.cardIcon} />
                  <FaCreditCard className={styles.cardIcon} />
                </div>
              </div>

              <div className={styles.securityInfo}>
                <div className={styles.securityItem}><FaLock /><span>Pagamento seguro</span></div>
                <div className={styles.securityItem}><FaShieldAlt /><span>Protegido contra fraudes</span></div>
                <div className={styles.securityItem}><FaTruck /><span>Entrega garantida</span></div>
              </div>

              <button className={styles.btnCheckout} onClick={handleCheckout} disabled={cartItemsWithDetails.filter(i => i.days > 0).length === 0}>
                <span>Prosseguir para pagamento</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}