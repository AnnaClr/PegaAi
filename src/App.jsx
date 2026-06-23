import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/routes';
import './styles/theme.css';
import './App.css';

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}