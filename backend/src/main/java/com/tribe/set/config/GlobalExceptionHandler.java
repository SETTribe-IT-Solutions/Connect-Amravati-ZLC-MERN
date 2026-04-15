package com.tribe.set.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        ex.printStackTrace(); // Log stack trace
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        if ("Bad credentials".equals(message)) {
            message = "Invalid credentials";
        }
        error.put("message", message);
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        ex.printStackTrace(); // Log stack trace
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        errors.put("status", "error");
        errors.putIfAbsent("message", "Validation failed");
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        ex.printStackTrace(); // Log stack trace severely to console but not client
        Map<String, String> error = new HashMap<>();
        // Avoid exposing direct raw exceptions to client as it may reveal internal
        // implementations
        error.put("message", "A processing error occurred on the server.");
        error.put("status", "error");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
