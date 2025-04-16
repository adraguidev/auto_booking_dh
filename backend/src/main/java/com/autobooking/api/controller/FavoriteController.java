package com.autobooking.api.controller;

import com.autobooking.api.model.Product;
import com.autobooking.api.security.JwtUtil;
import com.autobooking.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users/{userId}/favorites")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class FavoriteController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public FavoriteController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Obtiene los productos favoritos de un usuario.
     * 
     * @param userId ID del usuario
     * @param request HTTP request para verificación de token
     * @return Lista de productos favoritos del usuario
     */
    @GetMapping
    public ResponseEntity<?> getUserFavorites(@PathVariable Long userId, HttpServletRequest request) {
        try {
            // Validar que el usuario autenticado es el mismo que solicita sus favoritos
            validateUserAccess(request, userId);
            
            Set<Product> favorites = userService.getFavorites(userId);
            return ResponseEntity.ok(favorites);
        } catch (ResponseStatusException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getReason());
            return new ResponseEntity<>(response, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al obtener favoritos: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Añade un producto a los favoritos de un usuario.
     * 
     * @param userId ID del usuario
     * @param requestBody Contiene el ID del producto a añadir
     * @param request HTTP request para verificación de token
     * @return Producto añadido a favoritos
     */
    @PostMapping
    public ResponseEntity<?> addFavorite(
            @PathVariable Long userId, 
            @RequestBody Map<String, Long> requestBody,
            HttpServletRequest request) {
        
        try {
            // Validar que el usuario autenticado es el mismo que añade el favorito
            validateUserAccess(request, userId);
            
            // Obtener el ID del producto del cuerpo de la petición
            Long productId = requestBody.get("productId");
            if (productId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Se requiere productId"));
            }
            
            // Añadir a favoritos
            Product product = userService.addFavorite(userId, productId);
            
            return new ResponseEntity<>(product, HttpStatus.CREATED);
        } catch (ResponseStatusException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getReason());
            return new ResponseEntity<>(response, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al añadir favorito: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Elimina un producto de los favoritos de un usuario.
     * 
     * @param userId ID del usuario
     * @param productId ID del producto a eliminar de favoritos
     * @param request HTTP request para verificación de token
     * @return Respuesta vacía con código 204
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFavorite(
            @PathVariable Long userId, 
            @PathVariable Long productId,
            HttpServletRequest request) {
        
        try {
            // Validar que el usuario autenticado es el mismo que elimina el favorito
            validateUserAccess(request, userId);
            
            // Eliminar de favoritos
            userService.removeFavorite(userId, productId);
            
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getReason());
            return new ResponseEntity<>(response, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al eliminar favorito: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Verifica si un producto está en los favoritos de un usuario.
     * 
     * @param userId ID del usuario
     * @param productId ID del producto
     * @param request HTTP request para verificación de token
     * @return true si el producto está en favoritos, false si no
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> isFavorite(
            @PathVariable Long userId, 
            @PathVariable Long productId,
            HttpServletRequest request) {
        
        try {
            // Validar que el usuario autenticado es el mismo que consulta sus favoritos
            validateUserAccess(request, userId);
            
            boolean isFavorite = userService.isFavorite(userId, productId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("isFavorite", isFavorite);
            
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getReason());
            return new ResponseEntity<>(response, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al verificar favorito: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Valida que el usuario autenticado tenga acceso a la operación solicitada.
     * 
     * @param request HTTP request con el token JWT
     * @param userId ID del usuario de la URL
     * @throws ResponseStatusException Si el usuario no está autenticado o no coincide
     */
    private void validateUserAccess(HttpServletRequest request, Long userId) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                "Debes iniciar sesión para acceder a esta funcionalidad");
        }

        try {
            token = token.substring(7); // Remove "Bearer " prefix
            Long tokenUserId = jwtUtil.getUserIdFromToken(token);
            
            // Usar el ID del token para las operaciones
            if (!tokenUserId.equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "No tienes permiso para acceder a los favoritos de otro usuario");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                "Tu sesión ha expirado. Por favor, inicia sesión nuevamente");
        }
    }
} 