package com.autobooking.api.service;

import com.autobooking.api.model.Product;
import com.autobooking.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product addProduct(Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty() ||
            product.getDescription() == null || product.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Nombre y descripción son obligatorios");
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
} 