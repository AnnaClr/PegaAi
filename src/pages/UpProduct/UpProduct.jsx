import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from './components aux/ImageUploader';
import api from '../../utils/axios';
import './UpProduct.css';

export default function UpProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [days, setDays] = useState('30');
  const [priceError, setPriceError] = useState('');
  const [daysError, setDaysError] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await api.get('/categories');
        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error.response?.data || error.message);
      }
    }
    fetchCategories();
  }, []);

  function handlePriceChange(event) {
    let value = event.target.value;
    value = value.replace(/\./g, ',');
    value = value.replace(/[^0-9,]/g, '');

    const [integer, ...decimals] = value.split(',');
    if (!integer) {
      setPrice('');
      return;
    }

    const formatted = `${integer}${decimals.length ? ',' + decimals.join('') : ''}`;
    setPrice(formatted);
    setPriceError('');
  }

  function handlePriceBlur() {
    if (price && !/^\d+(,\d{1,2})?$/.test(price)) {
      setPriceError('Use números reais com vírgula, ex: 123,45');
    }
  }

  function handleDaysChange(event) {
    const value = event.target.value.replace(/\D/g, '');
    setDays(value);
    setDaysError('');
  }

  function handleDaysBlur() {
    if (days && !/^\d+$/.test(days)) {
      setDaysError('Somente inteiros positivos');
    }
  }

  return (
    <main className="upProductContainer">
      <section className="upProductCard">
        <div className="upProductHeader">
          <h2>Publicar produto</h2>
          <p>Adicione informações e fotos para compartilhar o item com a comunidade.</p>
        </div>

        <div className="fieldGroup">
          <label htmlFor="productName">Nome do produto</label>
          <input
            id="productName"
            type="text"
            placeholder="Nome do produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="fieldGroup">
          <label htmlFor="productDesc">Descrição do produto</label>
          <textarea
            id="productDesc"
            placeholder="Descrição do produto"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div className="gridRow">
          <div className="fieldGroup">
            <label htmlFor="price">Preço diário do aluguel</label>
            <input
              id="price"
              type="text"
              placeholder="123,45"
              value={price}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
            />
            {priceError && <p className="fieldError">{priceError}</p>}
          </div>

          <div className="fieldGroup">
            <label htmlFor="days">Máximo de dias de aluguel</label>
            <input
              id="days"
              type="number"
              placeholder="30"
              value={days}
              onChange={handleDaysChange}
              onBlur={handleDaysBlur}
              min={1}
              step={1}
            />
            {daysError && <p className="fieldError">{daysError}</p>}
          </div>
        </div>

        <div className="fieldGroup">
          <label htmlFor="category">Categoria</label>
          <select
            name="category"
            id="category"
            onChange={(e) => setCategoryId(e.target.value)}
            value={categoryId}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="fieldNote">
          Preencha todos os dados e adicione imagens claras para aumentar a visibilidade do produto.
        </div>

        <ImageUploader
          name={name}
          price={price}
          desc={desc}
          categoryId={categoryId}
          days={days}
          onComplete={() => navigate('/products/my')}
        />
      </section>
    </main>
  );
}