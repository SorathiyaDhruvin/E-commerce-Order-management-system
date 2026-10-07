package com.shopsphere.service;

import com.shopsphere.dto.PaginatedResponse;
import com.shopsphere.dto.ProductDTO;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public PaginatedResponse<ProductDTO> getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productsPage = productRepository.findByActiveTrue(pageable);
        
        return mapToPaginatedResponse(productsPage);
    }
    
    public PaginatedResponse<ProductDTO> searchProducts(String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> productsPage = productRepository.searchProducts(keyword, categoryId, minPrice, maxPrice, pageable);
        
        return mapToPaginatedResponse(productsPage);
    }
    
    public PaginatedResponse<ProductDTO> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Product> productsPage = productRepository.findByCategory_IdAndActiveTrue(categoryId, pageable);
        return mapToPaginatedResponse(productsPage);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return mapToDTO(product);
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
                
        Product product = Product.builder()
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .price(productDTO.getPrice())
                .stockQuantity(productDTO.getStockQuantity())
                .imageUrl(productDTO.getImageUrl())
                .brand(productDTO.getBrand())
                .active(productDTO.isActive())
                .category(category)
                .build();
                
        return mapToDTO(productRepository.save(product));
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
                
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setImageUrl(productDTO.getImageUrl());
        product.setBrand(productDTO.getBrand());
        product.setActive(productDTO.isActive());
        product.setCategory(category);
        
        return mapToDTO(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }
    
    private ProductDTO mapToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .brand(product.getBrand())
                .active(product.isActive())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .build();
    }
    
    private PaginatedResponse<ProductDTO> mapToPaginatedResponse(Page<Product> productsPage) {
        List<ProductDTO> content = productsPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
                
        return PaginatedResponse.<ProductDTO>builder()
                .content(content)
                .page(productsPage.getNumber())
                .size(productsPage.getSize())
                .totalElements(productsPage.getTotalElements())
                .totalPages(productsPage.getTotalPages())
                .last(productsPage.isLast())
                .build();
    }
}
