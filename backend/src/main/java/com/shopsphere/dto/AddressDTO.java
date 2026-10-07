package com.shopsphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressDTO {
    
    private Long id;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    @NotBlank(message = "Address line is required")
    private String addressLine;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "State is required")
    private String state;
    
    @NotBlank(message = "Postal code is required")
    private String postalCode;
    
    @NotBlank(message = "Country is required")
    private String country;
    
    private boolean isDefault;
}
