package com.tribe.set.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.tribe.set.entity.Appreciation;
import com.tribe.set.entity.User;
import com.tribe.set.entity.NotificationType;
import com.tribe.set.dto.AppreciationRequest;
import com.tribe.set.dto.AppreciationResponse;
import com.tribe.set.repository.AppreciationRepository;
import com.tribe.set.repository.UserRepository;
import com.tribe.set.dto.UserResponse;

@Service
public class AppreciationService {

        @Autowired
        private AppreciationRepository appreciationRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private NotificationServices notificationServices;

        @org.springframework.transaction.annotation.Transactional
        public AppreciationResponse sendAppreciation(AppreciationRequest request) {
                User fromUser = userRepository.findByUserID(request.getFromUserId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Sender not found: " + request.getFromUserId()));

                User toUser = userRepository.findByUserID(request.getToUserId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Receiver not found: " + request.getToUserId()));

                Appreciation app = new Appreciation();
                app.setFromUser(fromUser);
                app.setToUser(toUser);
                app.setMessage(request.getMessage());
                app.setBadge(request.getBadge());
                app.setCreatedAt(LocalDateTime.now());

                // Update user appreciation status bypass validation by directly querying.
                userRepository.markUserAsAppreciated(toUser.getUserID());

                // Send notification including sender's Role
                String roleName = fromUser.getRole() != null ? fromUser.getRole().name() : "Member";
                String message = "You received a '" + request.getBadge() + "' appreciation from " + fromUser.getName() + " (" + roleName + ")";
                notificationServices.send(toUser, "New Appreciation", message, NotificationType.APPRECIATION, null);

                return AppreciationResponse.from(appreciationRepository.save(app));
        }

        public Page<AppreciationResponse> getAllAppreciations(String searchTerm, Pageable pageable) {
                return appreciationRepository.findAllFiltered(searchTerm, pageable)
                                .map(AppreciationResponse::from);
        }

        public Page<AppreciationResponse> getReceivedAppreciations(String userId, Pageable pageable) {
                User user = userRepository.findByUserID(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                return appreciationRepository.findByToUserOrderByCreatedAtDesc(user, pageable)
                                .map(AppreciationResponse::from);
        }

        public Page<AppreciationResponse> getSentAppreciations(String userId, Pageable pageable) {
                User user = userRepository.findByUserID(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                return appreciationRepository.findByFromUserOrderByCreatedAtDesc(user, pageable)
                                .map(AppreciationResponse::from);
        }

        public List<UserResponse> getEligibleUsers() {
                return userRepository.findEligibleForAppreciation()
                                .stream()
                                .map(UserResponse::from)
                                .collect(Collectors.toList());
        }
}
