package com.shopsphere.service;

import com.shopsphere.dto.CartDTO;
import com.shopsphere.dto.CartItemDTO;
import com.shopsphere.dto.CartItemRequest;
import com.shopsphere.entity.Cart;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.InsufficientStockException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartDTO getCart() {
        Cart cart = getOrCreateCart(getCurrentUser());
        return mapToDTO(cart);
    }

    @Transactional
    public CartDTO addItemToCart(CartItemRequest request) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                
        if (!product.isActive()) {
            throw new BadRequestException("Product is no longer available");
        }
        
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new InsufficientStockException("Not enough stock available");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new InsufficientStockException("Not enough stock available");
            }
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice()) // Store current price
                    .build();
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }
        
        return mapToDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO updateCartItemQuantity(Long itemId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }
        
        Cart cart = getOrCreateCart(getCurrentUser());
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
                
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }
        
        Product product = cartItem.getProduct();
        if (quantity > product.getStockQuantity()) {
            throw new InsufficientStockException("Not enough stock available");
        }
        
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        
        return mapToDTO(cartRepository.findById(cart.getId()).get());
    }

    @Transactional
    public CartDTO removeCartItem(Long itemId) {
        Cart cart = getOrCreateCart(getCurrentUser());
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
                
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }
        
        cart.removeItem(cartItem);
        cartRepository.save(cart);
        
        return mapToDTO(cart);
    }

    @Transactional
    public void clearCart() {
        Cart cart = getOrCreateCart(getCurrentUser());
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartDTO mapToDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(this::mapItemToDTO)
                .collect(Collectors.toList());
                
        BigDecimal total = itemDTOs.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemDTOs)
                .total(total)
                .build();
    }
    
    private CartItemDTO mapItemToDTO(CartItem item) {
        return CartItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImageUrl(item.getProduct().getImageUrl())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}
