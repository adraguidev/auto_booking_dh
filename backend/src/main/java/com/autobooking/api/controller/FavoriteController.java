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
            validateUserAccess(userId, request);
            
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
            validateUserAccess(userId, request);
            
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
            validateUserAccess(userId, request);
            
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
            validateUserAccess(userId, request);
            
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
     * @param userId ID del usuario de la URL
     * @param request HTTP request con el token JWT
     * @throws ResponseStatusException Si el usuario no está autenticado o no coincide
     */
    private void validateUserAccess(Long userId, HttpServletRequest request) throws ResponseStatusException {
        // Extraer el token de la cabecera Authorization
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token no proporcionado");
        }
        
        String token = authHeader.substring(7);
        
        // Verificar que el token es válido
        if (!jwtUtil.isTokenValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
        }
        
        // Obtener el ID del usuario del token
        Long tokenUserId = jwtUtil.getUserIdFromToken(token);
        
        // Verificar que el usuario del token coincide con el de la URL
        if (!userId.equals(tokenUserId) && !jwtUtil.isAdmin(token)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "No tienes permiso para acceder a los favoritos de otro usuario");
        }
    }
} 