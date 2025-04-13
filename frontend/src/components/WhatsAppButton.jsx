import React, { useState } from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = ({ productName }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Número de teléfono (ficticio) para el contacto - formato internacional sin + ni espacios
  const phoneNumber = '5491112345678';
  
  // Mensaje predefinido que incluye el nombre del producto (codificado para URL)
  const message = encodeURIComponent(`Hola, estoy interesado en el producto ${productName} que vi en AutoBooking.`);
  
  // URL para abrir WhatsApp con el número y mensaje
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  
  // URL del icono de WhatsApp
  const whatsappIconUrl = 'https://cdn-icons-png.flaticon.com/512/124/124034.png';
  
  // Manejar clic en el botón
  const handleClick = () => {
    // Mostrar un breve mensaje de confirmación
    setShowTooltip(true);
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
  };
  
  return (
    <>
      <a 
        href={whatsappUrl} 
        className="whatsapp-button"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        onClick={handleClick}
      >
        <img 
          src={whatsappIconUrl} 
          alt="WhatsApp" 
          className="whatsapp-icon" 
        />
      </a>
      
      {showTooltip && (
        <div className="whatsapp-tooltip">
          Conectando con el proveedor vía WhatsApp...
        </div>
      )}
    </>
  );
};

export default WhatsAppButton; 