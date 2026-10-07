package com.shopsphere.service;
import com.shopsphere.dto.WishlistDTO;
import com.shopsphere.dto.ProductDTO;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.entity.Wishlist;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    public List<WishlistDTO> getWishlist(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return wishlistRepository.findByUserId(user.getId()).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }
    
    @Transactional
    public WishlistDTO addToWishlist(String email, Long productId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();
        
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new RuntimeException("Product already in wishlist");
        }
        
        Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
        return mapToDTO(wishlistRepository.save(wishlist));
    }
    
    @Transactional
    public void removeFromWishlist(String email, Long productId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }
    
    private WishlistDTO mapToDTO(Wishlist wishlist) {
        WishlistDTO dto = new WishlistDTO();
        dto.setId(wishlist.getId());
        dto.setAddedAt(wishlist.getAddedAt());
        
        ProductDTO pDto = new ProductDTO();
        Product p = wishlist.getProduct();
        pDto.setId(p.getId());
        pDto.setName(p.getName());
        pDto.setDescription(p.getDescription());
        pDto.setPrice(p.getPrice());
        pDto.setStockQuantity(p.getStockQuantity());
        pDto.setImageUrl(p.getImageUrl());
        pDto.setBrand(p.getBrand());
        
        dto.setProduct(pDto);
        return dto;
    }
}
