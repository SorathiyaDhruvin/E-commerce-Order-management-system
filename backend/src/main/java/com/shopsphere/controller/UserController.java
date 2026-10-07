package com.shopsphere.controller;
import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.UserDTO;
import com.shopsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", userService.getProfile(auth.getName())));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(Authentication auth, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(auth.getName(), userDTO)));
    }
}
