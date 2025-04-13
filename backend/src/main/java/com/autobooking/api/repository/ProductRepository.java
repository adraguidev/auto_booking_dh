package com.autobooking.api.repository;

import com.autobooking.api.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Métodos para buscar por categoría
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryName(String categoryName);
    
    // Métodos para buscar por feature
    List<Product> findByFeaturesId(Long featureId);
} 