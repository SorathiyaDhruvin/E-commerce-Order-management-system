package com.shopsphere.controller;

import com.shopsphere.dto.AddressDTO;
import com.shopsphere.dto.ApiResponse;
import com.shopsphere.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDTO>>> getUserAddresses() {
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched successfully", addressService.getUserAddresses()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDTO>> getAddressById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Address fetched successfully", addressService.getAddressById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDTO>> createAddress(@Valid @RequestBody AddressDTO addressDTO) {
        return ResponseEntity.ok(ApiResponse.success("Address created successfully", addressService.createAddress(addressDTO)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDTO>> updateAddress(@PathVariable Long id, @Valid @RequestBody AddressDTO addressDTO) {
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", addressService.updateAddress(id, addressDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
}
