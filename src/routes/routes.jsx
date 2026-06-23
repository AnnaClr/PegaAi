import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from '../components/Auth/AuthGuard';
import Home from '../pages/Home/Home';
import Register from '../pages/Register/Register';
import Login from '../pages/Login/login';
import UpProduct from '../pages/UpProduct/UpProduct';
import ViewProduct from '../pages/ViewProduct/ViewProduct';
import Profile from '../pages/Profile/Profile';
import ProductsRentals from '../pages/ProductsRentals/ProductsRentals';
import ProductsMy from '../pages/MyProducts/MyProducts';
import Explorer from '../pages/Explorer/Explorer';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Checkout/Checkout';
import Dashboard from '../pages/Dashboard/Dashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/view/:id" element={<ViewProduct />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explorer" element={<Explorer />} />

          <Route element={<AuthGuard />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/products/rentals" element={<ProductsRentals />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products/my" element={<ProductsMy />} />
            <Route path="/product/up" element={<UpProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
        </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}