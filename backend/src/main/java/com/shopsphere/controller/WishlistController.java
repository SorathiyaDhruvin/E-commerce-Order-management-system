package com.shopsphere.controller;
import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.WishlistDTO;
import com.shopsphere.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistDTO>>> getWishlist(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Wishlist fetched", wishlistService.getWishlist(auth.getName())));
    }
    
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistDTO>> addToWishlist(Authentication auth, @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist", wishlistService.addToWishlist(auth.getName(), productId)));
    }
    
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(Authentication auth, @PathVariable Long productId) {
        wishlistService.removeFromWishlist(auth.getName(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }
}
