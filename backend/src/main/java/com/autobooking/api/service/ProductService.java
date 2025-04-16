package com.autobooking.api.service;

import com.autobooking.api.model.Feature;
import com.autobooking.api.model.Product;
import com.autobooking.api.model.Booking;
import com.autobooking.api.repository.FeatureRepository;
import com.autobooking.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final FeatureRepository featureRepository;
    private final BookingService bookingService;

    @Autowired
    public ProductService(ProductRepository productRepository, FeatureRepository featureRepository, BookingService bookingService) {
        this.productRepository = productRepository;
        this.featureRepository = featureRepository;
        this.bookingService = bookingService;
    }

    public Product addProduct(Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty() ||
            product.getDescription() == null || product.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Nombre y descripción son obligatorios");
        }
        
        if (product.getPrice() == null) {
            throw new IllegalArgumentException("El precio es obligatorio");
        }
        
        return productRepository.save(product);
    }
    
    public List<Product> findAll() {
        return productRepository.findAll();
    }
    
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado con ID: " + id);
        }
        productRepository.deleteById(id);
    }
    
    public List<Product> findByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }
    
    public List<Product> findByCategoryName(String categoryName) {
        return productRepository.findByCategoryName(categoryName);
    }
    
    public Product addFeatureToProduct(Long productId, Long featureId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Producto no encontrado con ID: " + productId));
        
        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Característica no encontrada con ID: " + featureId));
        
        product.addFeature(feature);
        return productRepository.save(product);
    }
    
    public Product removeFeatureFromProduct(Long productId, Long featureId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Producto no encontrado con ID: " + productId));
        
        Feature feature = featureRepository.findById(featureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Característica no encontrada con ID: " + featureId));
        
        product.removeFeature(feature);
        return productRepository.save(product);
    }
    
    public List<Product> findByFeatureId(Long featureId) {
        if (!featureRepository.existsById(featureId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Característica no encontrada con ID: " + featureId);
        }
        return productRepository.findByFeatureId(featureId);
    }
    
    public List<Product> findByFeatureName(String featureName) {
        return productRepository.findByFeatureName(featureName);
    }
    
    /**
     * Verifica si existe un producto con el ID especificado
     * 
     * @param id ID del producto a verificar
     * @return true si existe, false si no
     */
    public boolean existsById(Long id) {
        return productRepository.existsById(id);
    }
    
    /**
     * Encuentra un producto por su ID
     * 
     * @param id ID del producto a buscar
     * @return El producto encontrado
     * @throws ResponseStatusException si el producto no existe
     */
    public Product findById(Long id) {
        try {
            return productRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                            "Producto no encontrado con ID: " + id));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Error al buscar el producto: " + e.getMessage());
        }
    }
    
    /**
     * Busca productos disponibles por rango de fechas y categoría opcional
     * 
     * @param startDateStr Fecha de inicio del rango en formato YYYY-MM-DD
     * @param endDateStr Fecha de fin del rango en formato YYYY-MM-DD
     * @param categoryId ID de la categoría (opcional)
     * @return Lista de productos que cumplen con los criterios
     */
    public List<Product> searchProducts(String startDateStr, String endDateStr, Long categoryId) {
        System.out.println("DEBUG - Búsqueda de productos - startDate: " + startDateStr + 
                ", endDate: " + endDateStr + ", categoryId: " + categoryId);
                
        // Validar y parsear fechas si se proporcionaron
        LocalDate startDate = null;
        LocalDate endDate = null;
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        // Si se proporcionaron ambas fechas, validarlas
        if (startDateStr != null && endDateStr != null) {
            try {
                startDate = LocalDate.parse(startDateStr, formatter);
                endDate = LocalDate.parse(endDateStr, formatter);
            } catch (DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "Formato de fecha inválido. Usar YYYY-MM-DD");
            }
            
            // Validar que el rango de fechas sea válido
            if (startDate.isAfter(endDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        "La fecha de inicio debe ser anterior o igual a la fecha de fin");
            }
        } else if (startDateStr != null || endDateStr != null) {
            // Si solo se proporcionó una fecha, exigir ambas
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Debe proporcionar ambas fechas (inicio y fin) para búsqueda por fechas");
        }
        
        // Obtener productos según la categoría
        List<Product> products;
        
        if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else {
            products = productRepository.findAll();
        }
        
        System.out.println("DEBUG - Productos encontrados antes de filtrar por fechas: " + products.size());
        
        // Si no se proporcionaron fechas, devolver todos los productos
        if (startDate == null || endDate == null) {
            System.out.println("DEBUG - No se proporcionaron fechas, devolviendo todos los productos");
            return products;
        }
        
        // Filtrar productos por disponibilidad
        List<Product> availableProducts = new ArrayList<>();
        
        for (Product product : products) {
            System.out.println("DEBUG - Verificando disponibilidad para producto: " + product.getId() + " - " + product.getName());
            
            // Verificar si el producto está disponible para el rango de fechas
            boolean isAvailable = bookingService.isProductAvailable(product.getId(), startDate, endDate);
            
            System.out.println("DEBUG - Producto " + product.getId() + " disponible: " + isAvailable);
            
            if (isAvailable) {
                availableProducts.add(product);
            }
        }
        
        System.out.println("DEBUG - Productos disponibles después de filtrar: " + availableProducts.size());
        
        return availableProducts;
    }

    public Product updateProductPrice(Long id, BigDecimal newPrice) {
        Product product = findById(id);
        if (product == null) {
            throw new NoSuchElementException("Producto no encontrado con ID: " + id);
        }
        product.setPrice(newPrice);
        return productRepository.save(product);
    }
} 