package com.autobooking.api.controller;

import com.autobooking.api.model.Category;
import com.autobooking.api.model.Feature;
import com.autobooking.api.model.Product;
import com.autobooking.api.service.CategoryService;
import com.autobooking.api.service.FeatureService;
import com.autobooking.api.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ProductController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final FeatureService featureService;

    @Autowired
    public ProductController(ProductService productService, CategoryService categoryService, FeatureService featureService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.featureService = featureService;
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody Map<String, Object> productRequest) {
        try {
            Product product = new Product();
            product.setName((String) productRequest.get("name"));
            product.setDescription((String) productRequest.get("description"));
            
            // Obtener imágenes del request
            @SuppressWarnings("unchecked")
            List<String> images = (List<String>) productRequest.get("images");
            product.setImages(images);
            
            // Procesar la categoría si está presente
            if (productRequest.containsKey("categoryId") && productRequest.get("categoryId") != null) {
                try {
                    Long categoryId = Long.valueOf(productRequest.get("categoryId").toString());
                    Category category = categoryService.findById(categoryId);
                    product.setCategory(category);
                } catch (NumberFormatException e) {
                    // Ignorar si el categoryId no es un número válido
                }
            }
            
            // Procesar las características (features) si están presentes
            if (productRequest.containsKey("featureIds") && productRequest.get("featureIds") != null) {
                try {
                    @SuppressWarnings("unchecked")
                    List<Integer> featureIds = (List<Integer>) productRequest.get("featureIds");
                    Set<Feature> features = new HashSet<>();
                    
                    for (Integer featureId : featureIds) {
                        Feature feature = featureService.findById(featureId.longValue());
                        features.add(feature);
                    }
                    
                    product.setFeatures(features);
                } catch (Exception e) {
                    // Manejar cualquier error al procesar los features
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Error al procesar características: " + e.getMessage());
                    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
                }
            }
            
            Product savedProduct = productService.addProduct(product);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (ResponseStatusException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getReason());
            return new ResponseEntity<>(errorResponse, e.getStatusCode());
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al crear producto: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.findAll();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Producto eliminado");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Producto no encontrado con ID: " + id));
        }
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.findByCategoryId(categoryId);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
} 