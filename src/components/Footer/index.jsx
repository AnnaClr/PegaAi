import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { FaCopyright } from 'react-icons/fa6';
import styles from './footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoPega}>Pega</span>
              <span className={styles.logoAi}>Aí</span>
              <span className={styles.logoPlus}>+</span>
            </Link>
            <p>A plataforma inteligente para aluguel e compartilhamento de objetos. Economize, ganhe dinheiro e ajude o planeta.</p>
            <div className={styles.socialLinks}>
              <a 
                href="#" 
                className={styles.socialLink}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer">
                <FaInstagram size={20} />
              </a>
              <a 
                href="#" 
                className={styles.socialLink}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer">
                <FaFacebookF size={20} />
              </a>
              <a 
                href="#" 
                className={styles.socialLink}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer">
                <FaLinkedinIn size={20} />
              </a>
              <a 
                href="#" 
                className={styles.socialLink}
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer">
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
          
          <div className={styles.footerLinks}>
            <h4>Sobre Nós</h4>
            <ul>
              <li><Link to="/sobre">Quem somos</Link></li>
              <li><Link to="/carreiras">Carreiras</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/imprensa">Imprensa</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerLinks}>
            <h4>Ajuda</h4>
            <ul>
              <li><Link to="/ajuda">Central de Ajuda</Link></li>
              <li><Link to="/como-alugar">Como alugar</Link></li>
              <li><Link to="/como-anunciar">Como anunciar</Link></li>
              <li><Link to="/seguranca">Segurança</Link></li>
            </ul>
          </div>
          
          <div className={styles.footerLinks}>
            <h4>Legal</h4>
            <ul>
              <li><Link to="/termos">Termos de uso</Link></li>
              <li><Link to="/privacidade">Privacidade</Link></li>
              <li><Link to="/cookies">Cookies</Link></li>
              <li><Link to="/licencas">Licenças</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>
            <FaCopyright size={14} style={{ marginRight: '4px' }} />
            {currentYear} PegaAí+ - Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}