package com.autobooking.api.security;

import com.autobooking.api.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Clave secreta para firmar los tokens, puede configurarse en application.properties
    @Value("${jwt.secret:MiSecretoJWT123}")
    private String secretKey;
    
    // Tiempo de expiración del token - 24 horas
    private static final long JWT_TOKEN_VALIDITY = 24 * 60 * 60 * 1000;
    
    // Genera un token para un usuario
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        claims.put("isAdmin", user.getIsAdmin());
        
        return createToken(claims, user.getEmail());
    }
    
    // Crea un token con las claims y subject específicos
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_TOKEN_VALIDITY);
        
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes());
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    // Valida el token y retorna los claims
    public Claims validateToken(String token) {
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    /**
     * Verifica si un token es válido.
     * 
     * @param token el token JWT a validar
     * @return true si el token es válido, false en caso contrario
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = validateToken(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Obtiene el ID del usuario desde el token.
     * 
     * @param token el token JWT
     * @return el ID del usuario
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = validateToken(token);
        return ((Number) claims.get("id")).longValue();
    }
    
    /**
     * Verifica si el usuario asociado al token es administrador.
     * 
     * @param token el token JWT
     * @return true si el usuario es administrador, false en caso contrario
     */
    public boolean isAdmin(String token) {
        Claims claims = validateToken(token);
        return Boolean.TRUE.equals(claims.get("isAdmin"));
    }
    
    // Extrae el email (subject) del token
    public String getEmailFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }
    
    // Verifica si el token ha expirado
    public Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
    
    // Obtiene la fecha de expiración del token
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }
    
    // Método genérico para obtener cualquier claim del token
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = validateToken(token);
        return claimsResolver.apply(claims);
    }
} 