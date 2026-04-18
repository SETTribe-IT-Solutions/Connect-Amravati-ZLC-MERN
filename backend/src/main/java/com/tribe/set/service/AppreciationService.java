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
                app.setFromUserId(request.getFromUserId());
                app.setToUserId(request.getToUserId());
                app.setMessage(request.getMessage());
                app.setBadge(request.getBadge());
                app.setCreatedAt(LocalDateTime.now());

                // Update user appreciation status bypass validation by directly querying.
                userRepository.markUserAsAppreciated(request.getToUserId());

                // Send notification including sender's Role
                String roleName = fromUser.getRole() != null ? fromUser.getRole().name() : "Member";
                String message = "You received a '" + request.getBadge() + "' appreciation from " + fromUser.getName() + " (" + roleName + ")";
                notificationServices.send(request.getToUserId(), "New Appreciation", message, NotificationType.APPRECIATION, null);

                return AppreciationResponse.from(appreciationRepository.save(app), fromUser, toUser);
        }

        public Page<AppreciationResponse> getAllAppreciations(String searchTerm, Pageable pageable) {
                Page<Appreciation> apps = appreciationRepository.findAllFiltered(searchTerm, pageable);
                return mapToResponsePage(apps, pageable);
        }

        public Page<AppreciationResponse> getReceivedAppreciations(String userId, Pageable pageable) {
                Page<Appreciation> apps = appreciationRepository.findByToUserIdOrderByCreatedAtDesc(userId, pageable);
                return mapToResponsePage(apps, pageable);
        }

        public Page<AppreciationResponse> getSentAppreciations(String userId, Pageable pageable) {
                Page<Appreciation> apps = appreciationRepository.findByFromUserIdOrderByCreatedAtDesc(userId, pageable);
                return mapToResponsePage(apps, pageable);
        }

        private Page<AppreciationResponse> mapToResponsePage(Page<Appreciation> apps, Pageable pageable) {
                java.util.Set<String> userIds = new java.util.HashSet<>();
                apps.forEach(a -> {
                        userIds.add(a.getFromUserId());
                        userIds.add(a.getToUserId());
                });

                java.util.Map<String, User> userMap = userRepository.findAllByUserIDIn(userIds).stream()
                        .collect(Collectors.toMap(User::getUserID, u -> u));

                return apps.map(a -> AppreciationResponse.from(a, userMap.get(a.getFromUserId()), userMap.get(a.getToUserId())));
        }

        public List<UserResponse> getEligibleUsers() {
                return userRepository.findEligibleForAppreciation()
                                .stream()
                                .map(UserResponse::from)
                                .collect(Collectors.toList());
        }
}
