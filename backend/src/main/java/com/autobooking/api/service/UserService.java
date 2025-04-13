package com.autobooking.api.service;

import com.autobooking.api.model.User;
import com.autobooking.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    // Patrón para validar email (simple, contiene @ y al menos un punto después)
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    
    // Patrón para validar contraseña (mínimo 6 caracteres, al menos una letra y un número)
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$");

    @Autowired
    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
        
        // TODO: Implementar lógica para primer usuario = admin, si se requiere
        // if (userRepository.count() == 0) {
        //     user.setIsAdmin(true);
        // }
        
        // Guardar usuario
        return userRepository.save(user);
    }
    
    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    private boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }
} 