package com.shopsphere.service;

import com.shopsphere.dto.PaginatedResponse;
import com.shopsphere.dto.ProductDTO;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Category category;
    private ProductDTO productDTO;

    @BeforeEach
    void setUp() {
        category = Category.builder()
                .id(1L)
                .name("Electronics")
                .description("Electronic Items")
                .build();

        product = Product.builder()
                .id(1L)
                .name("Smartphone")
                .description("Latest model smartphone")
                .price(new BigDecimal("699.99"))
                .stockQuantity(50)
                .imageUrl("phone.jpg")
                .brand("TechBrand")
                .active(true)
                .category(category)
                .build();

        productDTO = ProductDTO.builder()
                .name("Smartphone")
                .description("Latest model smartphone")
                .price(new BigDecimal("699.99"))
                .stockQuantity(50)
                .imageUrl("phone.jpg")
                .brand("TechBrand")
                .active(true)
                .categoryId(1L)
                .build();
    }

    @Test
    void getAllProducts_ShouldReturnPaginatedResponse() {
        // Arrange
        Page<Product> page = new PageImpl<>(Collections.singletonList(product));
        when(productRepository.findByActiveTrue(any(PageRequest.class))).thenReturn(page);

        // Act
        PaginatedResponse<ProductDTO> response = productService.getAllProducts(0, 10, "id", "desc");

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Smartphone", response.getContent().get(0).getName());
        verify(productRepository, times(1)).findByActiveTrue(any(PageRequest.class));
    }

    @Test
    void getProductById_WhenProductExists_ShouldReturnProductDTO() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        ProductDTO result = productService.getProductById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(product.getId(), result.getId());
        assertEquals(product.getName(), result.getName());
    }

    @Test
    void getProductById_WhenProductDoesNotExist_ShouldThrowException() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(1L));
    }

    @Test
    void createProduct_ShouldSaveAndReturnProductDTO() {
        // Arrange
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        ProductDTO result = productService.createProduct(productDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Smartphone", result.getName());
        assertEquals(category.getId(), result.getCategoryId());
        verify(categoryRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void updateProduct_WhenProductExists_ShouldUpdateAndReturnProductDTO() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        productDTO.setName("Updated Smartphone");

        // Act
        ProductDTO result = productService.updateProduct(1L, productDTO);

        // Assert
        assertNotNull(result);
        verify(productRepository, times(1)).findById(1L);
        verify(categoryRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void deleteProduct_WhenProductExists_ShouldSoftDelete() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        productService.deleteProduct(1L);

        // Assert
        assertFalse(product.isActive());
        verify(productRepository, times(1)).save(product);
    }
}
