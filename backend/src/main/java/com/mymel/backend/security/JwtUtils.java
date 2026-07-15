package com.mymel.backend.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${mymel.jwt.secret:defaultSecretKeyNeedToChangeThisBeforeProduction1234567}")
    private String jwtSecret;

    @Value("${mymel.jwt.expirationMs:86400000}")
    private int jwtExpirationMs;

    private static final String COOKIE_NAME = "mymel_token";

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public ResponseCookie generateJwtCookie(String token) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .path("/")
                .httpOnly(true)
                .secure(false) // Set false for local HTTP development (otherwise cookies won't save without HTTPS)
                .sameSite("Lax")
                .maxAge(jwtExpirationMs / 1000)
                .build();
    }

    public ResponseCookie cleanJwtCookie() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .path("/")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .maxAge(0)
                .build();
    }

    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public String getUsernameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateJwtToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // invalid token
        }
        return false;
    }
}
