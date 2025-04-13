package com.autobooking.api.repository;

import com.autobooking.api.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Métodos para buscar por categoría
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryName(String categoryName);
    
    // Métodos para buscar por características
    @Query("SELECT p FROM Product p JOIN p.features f WHERE f.id = :featureId")
    List<Product> findByFeatureId(@Param("featureId") Long featureId);
    
    @Query("SELECT p FROM Product p JOIN p.features f WHERE f.name = :featureName")
    List<Product> findByFeatureName(@Param("featureName") String featureName);
} 