import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Home from './components/Home/Home.jsx'
import Profile from './components/Profile/Profile.jsx'
import UpProduct from './components/UpProduct/UpProduct.jsx'
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <header>
        <nav>
          <NavLink to="/" end style={({ isActive }) => ({ margin: 8, textDecoration: 'none', color: isActive ? '#0070f3' : '#000' })}>
            Home
          </NavLink>
          <NavLink to="/profile" style={({ isActive }) => ({ margin: 8, textDecoration: 'none', color: isActive ? '#0070f3' : '#000' })}>
            Profile
          </NavLink>
          <NavLink to="/up/product" style={({ isActive }) => ({ margin: 8, textDecoration: 'none', color: isActive ? '#0070f3' : '#000' })}>
            UpProduct
          </NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/up/product" element={<UpProduct />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
