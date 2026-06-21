import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Register from '../pages/Register/Register';
import Login from '../pages/Login/login';
import Explorer from '../pages/Explorer/Explorer';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Checkout/Checkout';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}