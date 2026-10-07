package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.DashboardDTO;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderStatus;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        long pendingOrders = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.PENDING)
                .count();
                
        long deliveredOrders = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED)
                .count();
                
        long lowStockProducts = productRepository.findByStockQuantityLessThanEqual(5).size();
        
        DashboardDTO dashboardDTO = DashboardDTO.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .lowStockProducts(lowStockProducts)
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched successfully", dashboardDTO));
    }
}
