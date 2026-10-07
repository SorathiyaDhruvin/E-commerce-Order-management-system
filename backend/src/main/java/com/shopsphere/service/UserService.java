package com.shopsphere.service;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    public UserDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }
    
    @Transactional
    public UserDTO updateProfile(String email, UserDTO updateDTO) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        if(updateDTO.getFirstName() != null) user.setFirstName(updateDTO.getFirstName());
        if(updateDTO.getLastName() != null) user.setLastName(updateDTO.getLastName());
        if(updateDTO.getPhone() != null) user.setPhone(updateDTO.getPhone());
        return mapToDTO(userRepository.save(user));
    }
    
    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
