package com.autobooking.api.controller;

import com.autobooking.api.model.User;
import com.autobooking.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (ResponseStatusException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getReason());
            return new ResponseEntity<>(response, e.getStatusCode());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al registrar usuario: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 