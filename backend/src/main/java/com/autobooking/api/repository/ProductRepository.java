package com.autobooking.api.repository;

import com.autobooking.api.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // No es necesario agregar métodos adicionales para este prompt
} 