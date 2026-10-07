package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.CartDTO;
import com.shopsphere.dto.CartItemRequest;
import com.shopsphere.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDTO>> getCart() {
        return ResponseEntity.ok(ApiResponse.success("Cart fetched successfully", cartService.getCart()));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDTO>> addItemToCart(@Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cartService.addItemToCart(request)));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDTO>> updateCartItemQuantity(
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", cartService.updateCartItemQuantity(itemId, quantity)));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDTO>> removeCartItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cartService.removeCartItem(itemId)));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}
