package com.tribe.set.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tribe.set.Entity.Appreciation;
import com.tribe.set.Entity.User;
import com.tribe.set.dto.AppreciationRequest;
import com.tribe.set.dto.AppreciationResponse;
import com.tribe.set.repository.AppreciationRepository;
import com.tribe.set.repository.UserRepository;

@Service
public class AppreciationService {

        @Autowired
        private AppreciationRepository appreciationRepository;

        @Autowired
        private UserRepository userRepository;

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

                return AppreciationResponse.from(appreciationRepository.save(app));
        }

        public List<AppreciationResponse> getAllAppreciations() {
                return appreciationRepository.findAllByOrderByCreatedAtDesc()
                                .stream()
                                .map(AppreciationResponse::from)
                                .collect(Collectors.toList());
        }

        public List<AppreciationResponse> getReceivedAppreciations(Long userId) {
                User user = userRepository.findByUserID(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                return appreciationRepository.findByToUserOrderByCreatedAtDesc(user)
                                .stream()
                                .map(AppreciationResponse::from)
                                .collect(Collectors.toList());
        }

        public List<AppreciationResponse> getSentAppreciations(Long userId) {
                User user = userRepository.findByUserID(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                return appreciationRepository.findByFromUserOrderByCreatedAtDesc(user)
                                .stream()
                                .map(AppreciationResponse::from)
                                .collect(Collectors.toList());
        }
}