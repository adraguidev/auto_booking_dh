package com.autobooking.api.controller;

import com.autobooking.api.model.Category;
import com.autobooking.api.model.Feature;
import com.autobooking.api.model.Product;
import com.autobooking.api.model.Booking;
import com.autobooking.api.service.CategoryService;
import com.autobooking.api.service.FeatureService;
import com.autobooking.api.service.ProductService;
import com.autobooking.api.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ProductController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final FeatureService featureService;
    private final BookingService bookingService;

    @Autowired
    public ProductController(ProductService productService, CategoryService categoryService, FeatureService featureService, BookingService bookingService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.featureService = featureService;
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody Map<String, Object> productRequest) {
        try {
            Product product = new Product();
            product.setName((String) productRequest.get("name"));
            product.setDescription((String) productRequest.get("description"));
            
            // Obtener precio del request
            if (productRequest.containsKey("price")) {
                BigDecimal price = new BigDecimal(productRequest.get("price").toString());
                product.setPrice(price);
            }
            
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
            System.out.println("DEBUG - Endpoint searchProducts - startDate: " + startDate + 
                    ", endDate: " + endDate + ", categoryId: " + categoryId);
                    
            List<Product> results = productService.searchProducts(startDate, endDate, categoryId);
            
            System.out.println("DEBUG - Resultados encontrados: " + results.size());
            
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
            System.out.println("ERROR - searchProducts: " + e.getReason());
            return new ResponseEntity<>(errorResponse, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al buscar productos: " + e.getMessage());
            System.out.println("ERROR - searchProducts: " + e.getMessage());
            e.printStackTrace();
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
            // Verifica si el producto existe
            Product product = productService.findById(id);
            System.out.println("DEBUG - Buscando fechas no disponibles para producto: " + id);
            
            // Obtener las reservas activas para el producto
            List<Booking> activeBookings = bookingService.getActiveBookingsForProduct(id);
            System.out.println("DEBUG - Reservas activas encontradas: " + activeBookings.size());
            
            // Información adicional sobre la consulta
            System.out.println("DEBUG - Consulta SQL ejecutada: findActiveBookingsByProductId con id=" + id);
            System.out.println("DEBUG - Parámetros - productId: " + id + ", cancelledStatus: " + Booking.BookingStatus.CANCELLED);
            
            // Imprimir detalles de cada reserva
            for (Booking booking : activeBookings) {
                System.out.println("DEBUG - Reserva: " + booking.getId() + 
                    " - Desde: " + booking.getStartDate() + 
                    " - Hasta: " + booking.getEndDate() + 
                    " - Estado: " + booking.getStatus() +
                    " - Usuario: " + (booking.getUser() != null ? booking.getUser().getId() : "null"));
            }
            
            // Convertir las reservas a fechas no disponibles
            List<Map<String, Object>> unavailableDates = new ArrayList<>();
            
            for (Booking booking : activeBookings) {
                Map<String, Object> dateRange = new HashMap<>();
                dateRange.put("type", "range");
                String startDate = booking.getStartDate().toString();
                String endDate = booking.getEndDate().toString();
                dateRange.put("startDate", startDate);
                dateRange.put("endDate", endDate);
                unavailableDates.add(dateRange);
                System.out.println("DEBUG - Agregada fechas no disponibles desde: " + 
                    startDate + " hasta: " + endDate);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("productId", id);
            response.put("unavailableDates", unavailableDates);
            System.out.println("DEBUG - Respuesta final: " + response);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR - Error al obtener fechas no disponibles: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener fechas no disponibles: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.findById(id);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Producto no encontrado con ID: " + id));
            }
            return ResponseEntity.ok(product);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener el producto: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/debug")
    public ResponseEntity<?> getProductDebugInfo(@PathVariable Long id) {
        try {
            Product product = productService.findById(id);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Producto no encontrado con ID: " + id));
            }
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("id", product.getId());
            debugInfo.put("name", product.getName());
            debugInfo.put("price", product.getPrice());
            debugInfo.put("category", product.getCategory() != null ? product.getCategory().getName() : null);
            
            return new ResponseEntity<>(debugInfo, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/price")
    public ResponseEntity<?> updateProductPrice(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            BigDecimal newPrice = new BigDecimal(request.get("price").toString());
            Product updatedProduct = productService.updateProductPrice(id, newPrice);
            return ResponseEntity.ok(updatedProduct);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Producto no encontrado con ID: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al actualizar el precio: " + e.getMessage()));
        }
    }

    /**
     * Endpoint para depurar reservas de un producto
     * 
     * @param id ID del producto
     * @return Información de depuración de reservas
     */
    @GetMapping("/{id}/debug-bookings")
    public ResponseEntity<?> debugBookings(
            @PathVariable Long id,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            // Verificar si el producto existe
            Product product = productService.findById(id);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Producto no encontrado con ID: " + id));
            }
            
            // Obtener todas las reservas para el producto
            List<Booking> allBookings = bookingService.getBookingsByProduct(id);
            List<Booking> activeBookings = bookingService.getActiveBookingsForProduct(id);
            
            // Si se proporcionaron fechas, verificar disponibilidad
            LocalDate start = null;
            LocalDate end = null;
            boolean isAvailable = true;
            
            if (startDate != null && endDate != null) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    start = LocalDate.parse(startDate, formatter);
                    end = LocalDate.parse(endDate, formatter);
                    
                    isAvailable = bookingService.isProductAvailable(id, start, end);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Formato de fecha inválido. Use YYYY-MM-DD"));
                }
            }
            
            // Crear información de depuración
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("productId", id);
            debugInfo.put("totalBookings", allBookings.size());
            debugInfo.put("activeBookings", activeBookings.size());
            
            // Información de fechas y disponibilidad
            if (start != null && end != null) {
                debugInfo.put("requestedStartDate", start.toString());
                debugInfo.put("requestedEndDate", end.toString());
                debugInfo.put("isAvailable", isAvailable);
            }
            
            // Detalles de reservas activas
            List<Map<String, Object>> bookingDetails = new ArrayList<>();
            for (Booking booking : activeBookings) {
                Map<String, Object> details = new HashMap<>();
                details.put("id", booking.getId());
                details.put("startDate", booking.getStartDate().toString());
                details.put("endDate", booking.getEndDate().toString());
                details.put("status", booking.getStatus().toString());
                details.put("userId", booking.getUser().getId());
                
                if (start != null && end != null) {
                    boolean noOverlap = booking.getEndDate().isBefore(start) || booking.getStartDate().isAfter(end);
                    details.put("overlapsWithRequest", !noOverlap);
                }
                
                bookingDetails.add(details);
            }
            debugInfo.put("activeBookingDetails", bookingDetails);
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al obtener información de depuración: " + e.getMessage()));
        }
    }
} 