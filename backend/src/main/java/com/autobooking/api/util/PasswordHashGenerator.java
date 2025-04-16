package com.autobooking.api.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password123";
        String hashedPassword = encoder.encode(password);
        System.out.println("Contraseña original: " + password);
        System.out.println("Hash BCrypt: " + hashedPassword);
    }
} 