import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-brand">AutoBookingDH &copy; {new Date().getFullYear()}</div>
      <div className="footer-links">
        <a href="#" target="_blank" rel="noopener noreferrer">Política de privacidad</a>
        <span className="footer-separator">|</span>
        <a href="#" target="_blank" rel="noopener noreferrer">Términos y condiciones</a>
        <span className="footer-separator">|</span>
        <a href="mailto:aaguirreb16@gmail.com">Contacto</a>
      </div>
    </div>
  </footer>
);

export default Footer;
