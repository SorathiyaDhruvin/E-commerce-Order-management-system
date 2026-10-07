package com.shopsphere.service;

import com.shopsphere.dto.AddressDTO;
import com.shopsphere.entity.Address;
import com.shopsphere.entity.User;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.AddressRepository;
import com.shopsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressDTO> getUserAddresses() {
        User user = getCurrentUser();
        return addressRepository.findByUserId(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AddressDTO getAddressById(Long id) {
        User user = getCurrentUser();
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        return mapToDTO(address);
    }

    public AddressDTO createAddress(AddressDTO dto) {
        User user = getCurrentUser();
        
        // If it's the first address, make it default
        boolean isFirst = addressRepository.findByUserId(user.getId()).isEmpty();
        
        Address address = Address.builder()
                .user(user)
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .addressLine(dto.getAddressLine())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .country(dto.getCountry())
                .isDefault(isFirst || dto.isDefault())
                .build();
                
        if (address.isDefault()) {
            resetDefaultAddresses(user.getId());
        }
        
        return mapToDTO(addressRepository.save(address));
    }

    public AddressDTO updateAddress(Long id, AddressDTO dto) {
        User user = getCurrentUser();
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
                
        address.setFullName(dto.getFullName());
        address.setPhone(dto.getPhone());
        address.setAddressLine(dto.getAddressLine());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setPostalCode(dto.getPostalCode());
        address.setCountry(dto.getCountry());
        
        if (dto.isDefault() && !address.isDefault()) {
            resetDefaultAddresses(user.getId());
            address.setDefault(true);
        } else if (!dto.isDefault()) {
            address.setDefault(false);
        }
        
        return mapToDTO(addressRepository.save(address));
    }

    public void deleteAddress(Long id) {
        User user = getCurrentUser();
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    private void resetDefaultAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            addr.setDefault(false);
        }
        addressRepository.saveAll(addresses);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AddressDTO mapToDTO(Address address) {
        return AddressDTO.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .build();
    }
}
