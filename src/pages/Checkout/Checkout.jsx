import { useState } from 'react';
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
import { allProducts } from '../../data/mockData';
import styles from './checkout.module.css';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemsFromState = location.state?.cartItems || [
    {
      id: 1,
      product_id: 1,
      startDate: "05/04",
      endDate: "08/04",
      days: 3
    },
    {
      id: 2,
      product_id: 2,
      startDate: "06/04",
      endDate: "07/04",
      days: 2
    }
  ];

  const initialPaymentMethod = location.state?.paymentMethod || 'card';
  
  const [cartItems] = useState(cartItemsFromState);
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
    return allProducts.find(p => p.product_id === productId);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/carrinho');
    }
  };

  const handleConfirmOrder = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      navigate('/');
    }, 4000);
  };

  const cartItemsWithDetails = cartItems.map(item => {
    const product = getProductById(item.product_id);
    return {
      ...item,
      ...product,
      total: product ? product.price_per_day * item.days : 0
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
              {step === 2 && 'Revise seu pedido'}
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
                      <p>{item.days} dias · {item.startDate} a {item.endDate}</p>
                      <span>{formatCurrency(item.total)}</span>
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