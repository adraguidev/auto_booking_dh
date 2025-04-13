package com.autobooking.api.service;

import com.autobooking.api.model.Product;
import com.autobooking.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
} 