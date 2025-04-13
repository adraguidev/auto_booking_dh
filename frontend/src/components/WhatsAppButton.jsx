import React from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = ({ productName }) => {
  // Número de teléfono (ficticio) para el contacto - formato internacional sin + ni espacios
  const phoneNumber = '5491112345678';
  
  // Mensaje predefinido que incluye el nombre del producto (codificado para URL)
  const message = encodeURIComponent(`Hola, estoy interesado en el producto ${productName} que vi en AutoBooking.`);
  
  // URL para abrir WhatsApp con el número y mensaje
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  
  // URL del icono de WhatsApp
  const whatsappIconUrl = 'https://cdn-icons-png.flaticon.com/512/124/124034.png';
  
  return (
    <a 
      href={whatsappUrl} 
      className="whatsapp-button"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <img 
        src={whatsappIconUrl} 
        alt="WhatsApp" 
        className="whatsapp-icon" 
      />
    </a>
  );
};

export default WhatsAppButton; 