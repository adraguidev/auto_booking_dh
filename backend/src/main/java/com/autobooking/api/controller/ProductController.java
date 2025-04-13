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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    
    @PostMapping("/{productId}/features/{featureId}")
    public ResponseEntity<?> addFeatureToProduct(@PathVariable Long productId, @PathVariable Long featureId) {
        try {
            Product updatedProduct = productService.addFeatureToProduct(productId, featureId);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (ResponseStatusException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getReason());
            return new ResponseEntity<>(errorResponse, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al añadir característica: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @DeleteMapping("/{productId}/features/{featureId}")
    public ResponseEntity<?> removeFeatureFromProduct(@PathVariable Long productId, @PathVariable Long featureId) {
        try {
            Product updatedProduct = productService.removeFeatureFromProduct(productId, featureId);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (ResponseStatusException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getReason());
            return new ResponseEntity<>(errorResponse, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al eliminar característica: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/features/{featureId}")
    public ResponseEntity<List<Product>> getProductsByFeature(@PathVariable Long featureId) {
        try {
            List<Product> products = productService.findByFeatureId(featureId);
            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(null, e.getStatusCode());
        }
    }

    /**
     * Endpoint para búsqueda de productos por rango de fechas y categoría opcional
     *
     * @param startDate Fecha de inicio en formato YYYY-MM-DD
     * @param endDate Fecha de fin en formato YYYY-MM-DD
     * @param categoryId ID de categoría opcional
     * @return Lista de productos disponibles según los criterios
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long categoryId) {
        
        try {
            List<Product> results = productService.searchProducts(startDate, endDate, categoryId);
            
            // Información opcional sobre la búsqueda para el frontend
            Map<String, Object> response = new HashMap<>();
            response.put("results", results);
            response.put("count", results.size());
            response.put("totalProducts", productService.findAll().size());
            
            if (categoryId != null) {
                try {
                    Category category = categoryService.findById(categoryId);
                    response.put("categoryName", category.getName());
                } catch (Exception e) {
                    // Si la categoría no existe, no incluimos su nombre
                }
            }
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (ResponseStatusException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getReason());
            return new ResponseEntity<>(errorResponse, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al buscar productos: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint para obtener las fechas no disponibles de un producto
     * En el futuro, estas fechas se obtendrán de las reservas del producto
     * 
     * @param id ID del producto
     * @return Lista de fechas no disponibles
     */
    @GetMapping("/{id}/unavailable-dates")
    public ResponseEntity<?> getUnavailableDates(@PathVariable Long id) {
        try {
            // Verificar si el producto existe
            if (!productService.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Producto no encontrado"));
            }
            
            // En esta fase inicial, devolvemos fechas simuladas
            // En futuras implementaciones, esto se reemplazará con la lógica real
            // para consultar las reservas existentes
            
            LocalDate today = LocalDate.now();
            List<Map<String, String>> unavailableDates = new ArrayList<>();
            
            // Simulamos algunas fechas no disponibles (los próximos 3 días pares)
            for (int i = 2; i <= 10; i += 2) {
                LocalDate date = today.plusDays(i);
                Map<String, String> dateMap = new HashMap<>();
                dateMap.put("date", date.format(DateTimeFormatter.ISO_DATE));
                unavailableDates.add(dateMap);
            }
            
            // Simulamos un rango no disponible (desde hoy + 14 días, durante 3 días)
            LocalDate rangeStart = today.plusDays(14);
            LocalDate rangeEnd = rangeStart.plusDays(2);
            Map<String, String> rangeMap = new HashMap<>();
            rangeMap.put("startDate", rangeStart.format(DateTimeFormatter.ISO_DATE));
            rangeMap.put("endDate", rangeEnd.format(DateTimeFormatter.ISO_DATE));
            unavailableDates.add(rangeMap);
            
            return ResponseEntity.ok(Map.of(
                "productId", id,
                "unavailableDates", unavailableDates
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener fechas no disponibles: " + e.getMessage()));
        }
    }
} 