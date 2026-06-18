import { useEffect, useState } from 'react';
import ImageUploader from './components aux/ImageUploader';
import api from '../../utils/axios';

export default function UpProduct() {
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
    <main>
      <input type="text" placeholder="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea placeholder="Descrição do produto" value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
      <div>
        <input
          type="text"
          placeholder="Preço diario do aluguel"
          value={price}
          onChange={handlePriceChange}
          onBlur={handlePriceBlur}
        />
        {priceError && <div style={{ color: 'red', fontSize: '0.875rem' }}>{priceError}</div>}
      </div>
      <div>
        <input
          type="number"
          placeholder="Máximo de dias de aluguel"
          value={days}
          onChange={handleDaysChange}
          onBlur={handleDaysBlur}
          min={1}
          step={1}
        />
        {daysError && <div style={{ color: 'red', fontSize: '0.875rem' }}>{daysError}</div>}
      </div>
      <label htmlFor="category">Categoria: </label>
      <select name="category" id="category" onChange={(e) => setCategoryId(e.target.value)} value={categoryId}>
        {categories.map((category) => (
          <option key={category.category_id} value={category.category_id}>
            {category.name}
          </option>
        ))}
      </select>
      <ImageUploader name={name} price={price} desc={desc} categoryId={categoryId} />
    </main>
  );
}
