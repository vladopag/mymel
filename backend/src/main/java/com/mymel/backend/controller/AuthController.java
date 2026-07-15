package com.mymel.backend.controller;

import com.mymel.backend.dto.LoginRequest;
import com.mymel.backend.dto.RegisterRequest;
import com.mymel.backend.dto.UserResponse;
import com.mymel.backend.model.User;
import com.mymel.backend.model.UserRole;
import com.mymel.backend.repository.UserRepository;
import com.mymel.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                UserRole.USER
        );

        userRepository.save(user);

        // Auto login after registration
        String token = jwtUtils.generateToken(user.getUsername());
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(token);

        UserResponse userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(userResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
                String token = jwtUtils.generateToken(user.getUsername());
                ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(token);

                UserResponse userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                        .body(userResponse);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Invalid username or password!");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        ResponseCookie cookie = jwtUtils.cleanJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("You have been logged out!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            User user = (User) principal;
            UserResponse userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
            return ResponseEntity.ok(userResponse);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
    }
}
