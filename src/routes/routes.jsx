import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Home from '../pages/Home/Home';
import Register from '../pages/Register/Register';
import Login from '../pages/Login/login';
import UpProduct from '../components/UpProduct/UpProduct';
import ViewProduct from '../pages/ViewProduct/ViewProduct';
import Profile from '../pages/Profile/Profile';
import ProductsRentals from '../pages/ProductsRentals/ProductsRentals';
import ProductsMy from '../pages/ProductsMy/ProductsMy';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/up" element={<UpProduct />} />
          <Route path="/product/view/:id" element={<ViewProduct />} />
          <Route path="/products/rentals" element={<ProductsRentals />} /> 
          <Route path="/products/my" element={<ProductsMy />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}