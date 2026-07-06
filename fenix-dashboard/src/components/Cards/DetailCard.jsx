import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './DetailCard.css';
import { useDashboard } from '../../context/DashboardContext';

const DetailCard = ({ title }) => {
  const [activeTab, setActiveTab] = useState('Productos');
  const [selectedImage, setSelectedImage] = useState(null);
  const { data } = useDashboard();

  const tabs = ['Productos', 'Facturas', 'Imágenes'];

  const renderProductos = () => {
    if (!data) return <p>Cargando datos...</p>;
    const items = data.productosProcesados?.items || [];
    if (items.length === 0) return <p className="empty-state">No hay productos procesados en este periodo.</p>;
    
    return (
      <table className="detail-table">
        <thead>
          <tr>
            <th>Nombre del Producto</th>
            <th>SKU</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="name-cell">{item.nombre || 'Sin nombre'}</td>
              <td>{item.sku || '-'}</td>
              <td>{item.precio ? `$${item.precio}` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderFacturas = () => {
    if (!data) return <p>Cargando datos...</p>;
    const items = data.facturasProcesadas?.items || [];
    if (items.length === 0) return <p className="empty-state">No hay facturas procesadas en este periodo.</p>;
    
    return (
      <table className="detail-table">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Comprobante</th>
            <th>Cant. Productos</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="name-cell">{item.proveedor_nombre || 'Desconocido'}</td>
              <td>{item.comprobante || '-'}</td>
              <td>{item.cantidad_items || 0} items</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderImagenes = () => {
    if (!data) return <p>Cargando datos...</p>;
    const items = data.imagenesGeneradas?.items || [];
    if (items.length === 0) return <p className="empty-state">No hay imágenes procesadas en este periodo.</p>;
    
    return (
      <table className="detail-table">
        <thead>
          <tr>
            <th>SKU Producto</th>
            <th>Visualización</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="name-cell">
                {item.sku || '-'}
              </td>
              <td>
                {item.imagen_url ? (
                  <img 
                    src={item.imagen_url} 
                    alt="Miniatura" 
                    className="small-thumbnail-clickable" 
                    title="Ver Imagen"
                    onClick={() => setSelectedImage(item.imagen_url)}
                  />
                ) : (
                  <span className="text-muted">Sin imagen</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="detail-card card animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="detail-header">
        <h3 className="detail-title">{title}</h3>
      </div>
      
      <div className="detail-tabs mobile-only">
        {tabs.map(tab => (
          <button 
            key={tab}
            className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="detail-content custom-scrollbar">
        <div className="detail-sections-container">
          <div className={`detail-section ${activeTab === 'Productos' ? 'active-mobile' : ''}`}>
            <h4 className="desktop-only section-title">Productos</h4>
            {renderProductos()}
          </div>

          <div className={`detail-section ${activeTab === 'Facturas' ? 'active-mobile' : ''}`}>
            <h4 className="desktop-only section-title">Facturas</h4>
            {renderFacturas()}
          </div>

          <div className={`detail-section ${activeTab === 'Imágenes' ? 'active-mobile' : ''}`}>
            <h4 className="desktop-only section-title">Imágenes</h4>
            {renderImagenes()}
          </div>
        </div>
      </div>

      {selectedImage && createPortal(
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage} alt="Imagen ampliada" className="image-modal-full" />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DetailCard;
