package com.autobooking.api.controller;

import com.autobooking.api.model.Booking;
import com.autobooking.api.model.Product;
import com.autobooking.api.model.User;
import com.autobooking.api.repository.ProductRepository;
import com.autobooking.api.service.BookingService;
import com.autobooking.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final ProductRepository productRepository;

    @Autowired
    public BookingController(
            BookingService bookingService,
            UserService userService,
            ProductRepository productRepository) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.productRepository = productRepository;
    }

    /**
     * Endpoint para crear una nueva reserva
     * 
     * @param bookingRequest Datos de la reserva
     * @return Reserva creada
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> bookingRequest) {
        try {
            // Extraer datos del request
            Long productId = Long.valueOf(bookingRequest.get("productId").toString());
            Long userId = Long.valueOf(bookingRequest.get("userId").toString());
            LocalDate startDate = LocalDate.parse(bookingRequest.get("startDate").toString());
            LocalDate endDate = LocalDate.parse(bookingRequest.get("endDate").toString());
            
            // Validar que el usuario existe
            try {
                User currentUser = userService.getUserById(userId);
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                    throw new NoSuchElementException(e.getReason());
                }
                throw e;
            }
            
            // Validar fecha de inicio y fin
            if (startDate.isAfter(endDate)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "La fecha de inicio debe ser anterior a la fecha de fin");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            if (startDate.isBefore(LocalDate.now())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "No se pueden hacer reservas con fechas pasadas");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            // Obtener información del producto para depuración
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Producto no encontrado"));
            
            if (product.getPrice() == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "El producto no tiene un precio definido. Producto ID: " + productId);
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            // Crear la reserva
            Booking booking = bookingService.createBooking(userId, productId, startDate, endDate);
            
            // Construir respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("bookingId", booking.getId());
            response.put("message", "Reserva realizada con éxito");
            response.put("startDate", booking.getStartDate().toString());
            response.put("endDate", booking.getEndDate().toString());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (NoSuchElementException e) {
            // Error si el usuario o producto no existe
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            // Error si hay solapamiento con otra reserva
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (DateTimeParseException e) {
            // Error si las fechas tienen formato incorrecto
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Formato de fecha inválido. Use YYYY-MM-DD");
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (IllegalArgumentException e) {
            // Error en validación de inputs
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // Error genérico
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al crear la reserva: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Endpoint para obtener las reservas de un usuario
     * 
     * @param userId ID del usuario
     * @return Lista de reservas del usuario
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        try {
            // Validar que el usuario existe
            try {
                userService.getUserById(userId);
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                    throw new NoSuchElementException(e.getReason());
                }
                throw e;
            }
            
            return new ResponseEntity<>(bookingService.getBookingsByUser(userId), HttpStatus.OK);
        } catch (NoSuchElementException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener reservas: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Endpoint para obtener una reserva por su ID
     * 
     * @param id ID de la reserva
     * @return Reserva encontrada
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            return bookingService.getBookingById(id)
                .map(booking -> new ResponseEntity<Object>(booking, HttpStatus.OK))
                .orElseGet(() -> {
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Reserva no encontrada con ID: " + id);
                    return new ResponseEntity<Object>(errorResponse, HttpStatus.NOT_FOUND);
                });
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener la reserva: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Endpoint para cancelar una reserva
     * 
     * @param id ID de la reserva
     * @return Mensaje de confirmación
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            bookingService.cancelBooking(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Reserva cancelada con éxito");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al cancelar la reserva: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 