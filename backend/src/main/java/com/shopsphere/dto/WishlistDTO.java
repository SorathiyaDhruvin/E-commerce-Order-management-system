package com.shopsphere.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WishlistDTO {
    private Long id;
    private ProductDTO product;
    private LocalDateTime addedAt;
}
