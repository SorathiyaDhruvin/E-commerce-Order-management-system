package com.shopsphere.service;

import com.shopsphere.dto.AddressDTO;
import com.shopsphere.dto.OrderDTO;
import com.shopsphere.dto.OrderItemDTO;
import com.shopsphere.dto.OrderRequest;
import com.shopsphere.dto.PaginatedResponse;
import com.shopsphere.entity.*;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.InsufficientStockException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDTO placeOrder(OrderRequest request) {
        User user = getCurrentUser();
        
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
                
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot place order with an empty cart");
        }
        
        Address shippingAddress = addressRepository.findByIdAndUserId(request.getShippingAddressId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipping address not found"));
                
        // Validate stock and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (!product.isActive()) {
                throw new BadRequestException("Product " + product.getName() + " is no longer available");
            }
            if (cartItem.getQuantity() > product.getStockQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
            }
            totalAmount = totalAmount.add(cartItem.getSubtotal());
        }
        
        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingAddress(shippingAddress)
                .build();
                
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();
                    
            order.addItem(orderItem);
            
            // Reduce stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);
        
        return mapToDTO(savedOrder);
    }

    public PaginatedResponse<OrderDTO> getUserOrders(int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> ordersPage = orderRepository.findByUserId(user.getId(), pageable);
        return mapToPaginatedResponse(ordersPage);
    }

    public OrderDTO getOrderById(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return mapToDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
                
        if (order.getOrderStatus() != OrderStatus.PENDING && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled at this stage");
        }
        
        order.setOrderStatus(OrderStatus.CANCELLED);
        
        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
        
        return mapToDTO(orderRepository.save(order));
    }

    @Transactional
    public OrderDTO simulatePayment(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
                
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("Order is already paid");
        }
        
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        
        return mapToDTO(orderRepository.save(order));
    }

    // Admin Methods
    public PaginatedResponse<OrderDTO> getAllOrders(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> ordersPage;
        
        if (status != null && !status.isEmpty()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                ordersPage = orderRepository.findByOrderStatus(orderStatus, pageable);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid order status");
            }
        } else {
            ordersPage = orderRepository.findAll(pageable);
        }
        
        return mapToPaginatedResponse(ordersPage);
    }

    public OrderDTO getOrderByIdForAdmin(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return mapToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
                
        order.setOrderStatus(newStatus);
        return mapToDTO(orderRepository.save(order));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private OrderDTO mapToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productImageUrl(item.getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());
                
        Address address = order.getShippingAddress();
        AddressDTO addressDTO = AddressDTO.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .build();
                
        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .customerName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .shippingAddress(addressDTO)
                .items(itemDTOs)
                .createdAt(order.getCreatedAt())
                .build();
    }
    
    private PaginatedResponse<OrderDTO> mapToPaginatedResponse(Page<Order> ordersPage) {
        List<OrderDTO> content = ordersPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
                
        return PaginatedResponse.<OrderDTO>builder()
                .content(content)
                .page(ordersPage.getNumber())
                .size(ordersPage.getSize())
                .totalElements(ordersPage.getTotalElements())
                .totalPages(ordersPage.getTotalPages())
                .last(ordersPage.isLast())
                .build();
    }
}
