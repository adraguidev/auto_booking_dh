package com.autobooking.api.service;

import com.autobooking.api.model.Product;
import com.autobooking.api.model.User;
import com.autobooking.api.repository.ProductRepository;
import com.autobooking.api.repository.UserRepository;
import com.autobooking.api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    // Patrón para validar email (simple, contiene @ y al menos un punto después)
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    
    // Patrón para validar contraseña (mínimo 6 caracteres, al menos una letra y un número)
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$");

    @Autowired
    public UserService(UserRepository userRepository, ProductRepository productRepository, 
                      BCryptPasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    
    public User registerUser(User user) {
        // Validar que el email no esté ya registrado
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya está registrado");
        }
        
        // Validar email con regex
        if (!isValidEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de email inválido");
        }
        
        // Validar nombre y apellido
        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio");
        }
        
        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El apellido es obligatorio");
        }
        
        // Validar contraseña
        if (!isValidPassword(user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número");
        }
        
        // Codificar la contraseña
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Asegurar que isAdmin sea false para nuevos usuarios registrados
        user.setIsAdmin(false);
        
        // Si es el primer usuario, hacerlo admin
        if (userRepository.count() == 0) {
            user.setIsAdmin(true);
        }
        
        // Guardar usuario
        return userRepository.save(user);
    }
    
    public Map<String, Object> authenticate(String email, String password) {
        // Buscar el usuario por email
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email no registrado");
        }
        
        User user = userOptional.get();
        
        System.out.println("Intentando autenticar usuario: " + email);
        System.out.println("Contraseña proporcionada: " + password);
        System.out.println("Hash almacenado: " + user.getPassword());
        
        // Verificar la contraseña
        boolean matches = passwordEncoder.matches(password, user.getPassword());
        System.out.println("¿Las contraseñas coinciden? " + matches);
        
        if (!matches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
        }
        
        // Generar el token JWT
        String token = jwtUtil.generateToken(user);
        
        // Crear respuesta con token y datos del usuario
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName", user.getLastName());
        userData.put("email", user.getEmail());
        userData.put("isAdmin", user.getIsAdmin());
        
        response.put("user", userData);
        
        return response;
    }
    
    /**
     * Obtiene un usuario por su ID.
     * 
     * @param userId ID del usuario a buscar
     * @return el usuario encontrado
     * @throws ResponseStatusException si el usuario no existe
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Usuario no encontrado con ID: " + userId));
    }
    
    /**
     * Añade un producto a favoritos de un usuario.
     * 
     * @param userId ID del usuario
     * @param productId ID del producto a añadir a favoritos
     * @return el producto añadido a favoritos
     * @throws ResponseStatusException si el usuario o producto no existe
     */
    @Transactional
    public Product addFavorite(Long userId, Long productId) {
        User user = getUserById(userId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Producto no encontrado con ID: " + productId));
        
        user.addFavorite(product);
        userRepository.save(user);
        
        return product;
    }
    
    /**
     * Elimina un producto de favoritos de un usuario.
     * 
     * @param userId ID del usuario
     * @param productId ID del producto a eliminar de favoritos
     * @throws ResponseStatusException si el usuario no existe
     */
    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        User user = getUserById(userId);
        
        productRepository.findById(productId).ifPresent(product -> {
            user.removeFavorite(product);
            userRepository.save(user);
        });
    }
    
    /**
     * Obtiene todos los productos favoritos de un usuario.
     * 
     * @param userId ID del usuario
     * @return lista de productos favoritos
     * @throws ResponseStatusException si el usuario no existe
     */
    public Set<Product> getFavorites(Long userId) {
        User user = getUserById(userId);
        return user.getFavorites();
    }
    
    /**
     * Verifica si un producto está en los favoritos de un usuario.
     * 
     * @param userId ID del usuario
     * @param productId ID del producto
     * @return true si el producto está en favoritos, false en caso contrario
     * @throws ResponseStatusException si el usuario no existe
     */
    public boolean isFavorite(Long userId, Long productId) {
        User user = getUserById(userId);
        return user.hasFavorite(productId);
    }
    
    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    private boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }
} 