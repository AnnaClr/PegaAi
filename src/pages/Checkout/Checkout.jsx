import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaCreditCard, 
  FaQrcode, 
  FaBarcode, 
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa';
import { SiMercadopago, SiPicpay } from 'react-icons/si';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/axios';
import styles from './checkout.module.css';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const fromState = location.state?.cartItems;
  const fromStorage = (() => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Erro ao ler carrinho do localStorage', e);
      return [];
    }
  })();
  
  const allCartItems = fromState ?? fromStorage;
  const validCartItems = allCartItems.filter(item => item.days > 0);

  useEffect(() => {
    if (validCartItems.length === 0) {
      navigate('/cart');
    }
  }, [validCartItems.length, navigate]);

  const initialPaymentMethod = location.state?.paymentMethod || 'card';
  
  const [cartItemsState, setCartItemsState] = useState(validCartItems);
  const [periodErrors, setPeriodErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  const [step, setStep] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    installments: 1
  });

  const getProductById = (productId) => {
    return products.find(p => Number(p.product_id) === Number(productId));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const ids = cartItemsState.map(i => i.product_id).filter(Boolean);
        if (ids.length > 0) {
          const [prodResp, imgsResp] = await Promise.all([
            api.get(`/products?product_id=in.(${ids.join(',')})`),
            api.get(`/product_images?product_id=in.(${ids.join(',')})`)
          ]);
          if (!mounted) return;

          const prods = prodResp.data || [];
          const imgs = imgsResp.data || [];

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
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Erro ao carregar produtos para checkout', err.response?.data || err.message || err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [cartItemsState]);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/cart');
    }
  };

  const handleConfirmOrder = async () => {
    const itemsToConfirm = cartItemsState.filter(i => i.days > 0);
    if (itemsToConfirm.length === 0) {
      alert('Nenhum período válido para confirmar');
      return;
    }

    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(rawUser);

    const rentals = itemsToConfirm.map(item => ({
      user_id: user.user_id ?? user.id ?? user.userId,
      product_id: item.product_id,
      start_rental: item.startDate,
      end_rental: item.endDate
    }));

    try {
      await api.post('/rentals', rentals);

      try {
        const raw = localStorage.getItem('cart');
        if (raw) {
          const existing = JSON.parse(raw);
          const remaining = existing.filter(e => !itemsToConfirm.find(c => Number(c.product_id) === Number(e.product_id)));
          localStorage.setItem('cart', JSON.stringify(remaining));
        }
      } catch (err) {
        console.warn('Não foi possível atualizar o carrinho no localStorage', err);
      }

      setIsConfirmed(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Erro ao criar rentals', err.response?.data || err.message || err);
      alert('Erro ao processar o pedido. Tente novamente.');
    }
  };

  const cartItemsWithDetails = cartItemsState.map(item => {
    const product = getProductById(item.product_id);
    const price = Number(product?.price_per_day ?? product?.price ?? 0);
    return {
      ...item,
      ...product,
      total: price * (item.days || 0)
    };
  });

  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (isConfirmed) {
    return (
      <>
        <Header />
        <main className={styles.checkout}>
          <div className={styles.container}>
            <div className={styles.confirmationSection}>
              <div className={styles.confirmationIcon}>
                <FaCheckCircle />
              </div>
              <h3>Pedido finalizado com sucesso! 🎉</h3>
              <p className={styles.confirmationSubtitle}>Seu pedido foi confirmado e será processado em breve.</p>
              <p className={styles.confirmationText}>Você receberá um e-mail com os detalhes da sua locação.</p>
              <button 
                className={styles.btnHome}
                onClick={() => navigate('/')}
              >
                Voltar para a página inicial
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.checkout}>
        <div className={styles.container}>
          <div className={styles.checkoutHeader}>
            <p className={styles.checkoutSubtitle}>
              {step === 1 && 'Escolha a forma de pagamento'}
              {step === 2 && `Revise seu pedido (${cartItemsState.length} itens)`}
              {step === 3 && 'Confirme seu pedido'}
            </p>
          </div>

          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Pagamento</span>
            </div>
            <div className={`${styles.stepLine} ${step >= 2 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Revisão</span>
            </div>
            <div className={`${styles.stepLine} ${step >= 3 ? styles.active : ''}`}></div>
            <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepLabel}>Confirmação</span>
            </div>
          </div>

          <div className={styles.checkoutContent}>
            {step === 1 && (
              <div className={styles.paymentSection}>
                <h3>Forma de pagamento</h3>
                
                <div className={styles.paymentOptions}>
                  <button 
                    type="button"
                    className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FaCreditCard />
                    <span>Cartão</span>
                  </button>
                  <button 
                    type="button"
                    className={`${styles.paymentOption} ${paymentMethod === 'pix' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('pix')}
                  >
                    <FaQrcode />
                    <span>PIX</span>
                  </button>
                  <button 
                    type="button"
                    className={`${styles.paymentOption} ${paymentMethod === 'boleto' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('boleto')}
                  >
                    <FaBarcode />
                    <span>Boleto</span>
                  </button>
                  <button 
                    type="button"
                    className={`${styles.paymentOption} ${paymentMethod === 'mercado' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('mercado')}
                  >
                    <SiMercadopago />
                    <span>Mercado Pago</span>
                  </button>
                  <button 
                    type="button"
                    className={`${styles.paymentOption} ${paymentMethod === 'picpay' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('picpay')}
                  >
                    <SiPicpay />
                    <span>PicPay</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className={styles.cardForm}>
                    <h4>Dados do cartão</h4>
                    <div className={styles.formGroup}>
                      <label htmlFor="cardNumber">Número do cartão</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.cardNumber}
                        onChange={handleCardChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="cardName">Nome no cartão</label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        placeholder="Como está no cartão"
                        value={cardData.cardName}
                        onChange={handleCardChange}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="cardExpiry">Validade</label>
                        <input
                          type="text"
                          id="cardExpiry"
                          name="cardExpiry"
                          placeholder="MM/AA"
                          value={cardData.cardExpiry}
                          onChange={handleCardChange}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="cardCvv">CVV</label>
                        <input
                          type="text"
                          id="cardCvv"
                          name="cardCvv"
                          placeholder="123"
                          value={cardData.cardCvv}
                          onChange={handleCardChange}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="installments">Parcelas</label>
                      <select
                        id="installments"
                        name="installments"
                        value={cardData.installments}
                        onChange={handleCardChange}
                      >
                        <option value="1">1x sem juros</option>
                        <option value="2">2x sem juros</option>
                        <option value="3">3x sem juros</option>
                        <option value="4">4x sem juros</option>
                        <option value="5">5x sem juros</option>
                        <option value="6">6x sem juros</option>
                      </select>
                    </div>
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <div className={styles.pixInfo}>
                    <div className={styles.pixQrCode}>
                      <div className={styles.qrPlaceholder}>
                        <FaQrcode size={120} />
                      </div>
                    </div>
                    <div className={styles.pixDetails}>
                      <p><strong>Chave PIX:</strong> pix@pegaai.com</p>
                      <p><strong>Valor:</strong> {formatCurrency(total)}</p>
                      <p className={styles.pixNote}>Escaneie o QR Code com seu app de banco</p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'boleto' && (
                  <div className={styles.boletoInfo}>
                    <p>O boleto será gerado após a confirmação do pedido</p>
                    <p className={styles.boletoNote}>Prazo de pagamento: 3 dias úteis</p>
                  </div>
                )}

                {paymentMethod === 'mercado' && (
                  <div className={styles.mercadoInfo}>
                    <SiMercadopago size={48} color="#00b3e8" />
                    <p>Você será redirecionado para o Mercado Pago</p>
                  </div>
                )}

                {paymentMethod === 'picpay' && (
                  <div className={styles.picpayInfo}>
                    <SiPicpay size={48} color="#21c25e" />
                    <p>Você será redirecionado para o PicPay</p>
                  </div>
                )}

                <div className={styles.actions}>
                  <button 
                    type="button" 
                    className={styles.btnBack}
                    onClick={handleBack}
                  >
                    <FaArrowLeft />
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnContinue}
                    onClick={handleNextStep}
                  >
                    Revisar pedido
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.reviewSection}>
                <h3>Revisão do pedido</h3>

                {cartItemsWithDetails.map(item => (
                  <div key={item.id} className={styles.reviewItem}>
                    <img src={item.image} alt={item.name} />
                    <div className={styles.reviewItemInfo}>
                      <h4>{item.name}</h4>
                      <div className={styles.reviewDates}>
                        <span className={styles.dateInfo}>
                          <strong>Início:</strong> {item.startDate || '—'}
                        </span>
                        <span className={styles.dateInfo}>
                          <strong>Fim:</strong> {item.endDate || '—'}
                        </span>
                        <span className={styles.dateInfo}>
                          <strong>Dias:</strong> {item.days || '—'}
                        </span>
                      </div>
                      <span className={styles.reviewTotal}>{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                ))}

                <div className={styles.reviewSummary}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal ({cartItemsWithDetails.length} itens)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span>Total</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                </div>

                <div className={styles.reviewPayment}>
                  <h4>Forma de pagamento</h4>
                  <p>
                    {paymentMethod === 'card' && 'Cartão de crédito'}
                    {paymentMethod === 'pix' && 'PIX'}
                    {paymentMethod === 'boleto' && 'Boleto'}
                    {paymentMethod === 'mercado' && 'Mercado Pago'}
                    {paymentMethod === 'picpay' && 'PicPay'}
                  </p>
                  {paymentMethod === 'card' && (
                    <p className={styles.cardReview}>
                      **** **** **** {cardData.cardNumber.slice(-4)} · {cardData.installments}x
                    </p>
                  )}
                </div>

                <div className={styles.actions}>
                  <button 
                    type="button" 
                    className={styles.btnBack}
                    onClick={handleBack}
                  >
                    <FaArrowLeft />
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnConfirm}
                    onClick={handleNextStep}
                  >
                    Finalizar pedido
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.confirmSection}>
                <div className={styles.confirmIcon}>
                  <FaCheckCircle />
                </div>
                <h3>Confirmação final</h3>
                <p className={styles.confirmText}>Deseja realmente finalizar este pedido?</p>
                
                <div className={styles.confirmDetails}>
                  <div className={styles.confirmRow}>
                    <span>Total</span>
                    <strong className={styles.confirmTotal}>{formatCurrency(total)}</strong>
                  </div>
                  <div className={styles.confirmRow}>
                    <span>Forma de pagamento</span>
                    <strong>
                      {paymentMethod === 'card' && 'Cartão de crédito'}
                      {paymentMethod === 'pix' && 'PIX'}
                      {paymentMethod === 'boleto' && 'Boleto'}
                      {paymentMethod === 'mercado' && 'Mercado Pago'}
                      {paymentMethod === 'picpay' && 'PicPay'}
                    </strong>
                  </div>
                  <div className={styles.confirmRow}>
                    <span>Itens</span>
                    <strong>{cartItemsWithDetails.length} produtos</strong>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button 
                    type="button" 
                    className={styles.btnBack}
                    onClick={handleBack}
                  >
                    <FaArrowLeft />
                    Voltar
                  </button>
                  <button 
                    type="button" 
                    className={styles.btnFinalConfirm}
                    onClick={handleConfirmOrder}
                  >
                    Confirmar pedido
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}