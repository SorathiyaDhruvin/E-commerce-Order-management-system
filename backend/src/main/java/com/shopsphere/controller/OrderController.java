package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.OrderDTO;
import com.shopsphere.dto.OrderRequest;
import com.shopsphere.dto.PaginatedResponse;
import com.shopsphere.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> placeOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", orderService.placeOrder(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<OrderDTO>>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully", orderService.getUserOrders(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order fetched successfully", orderService.getOrderById(id)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", orderService.cancelOrder(id)));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<OrderDTO>> simulatePayment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment successful", orderService.simulatePayment(id)));
    }
}
