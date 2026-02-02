//
//  NotificationService.swift
//  KWBPN
//
//  FCM and local notification handling
//

import Foundation
import FirebaseMessaging
import UserNotifications

// MARK: - Protocol
protocol NotificationServiceProtocol {
    var fcmToken: String? { get }
    func requestPermission() async -> Bool
    func subscribeToTopic(_ topic: String) async throws
    func unsubscribeFromTopic(_ topic: String) async throws
    func getFCMToken() async throws -> String
}

// MARK: - Implementation
final class NotificationService: NotificationServiceProtocol {

    // MARK: - Singleton
    static let shared = NotificationService()

    // MARK: - Properties
    var fcmToken: String? {
        Messaging.messaging().fcmToken
    }

    // MARK: - Initialization
    private init() {
        setupTokenRefreshObserver()
    }

    // MARK: - Request Permission
    func requestPermission() async -> Bool {
        Logger.info("Requesting notification permission")

        do {
            let settings = await UNUserNotificationCenter.current().notificationSettings()

            switch settings.authorizationStatus {
            case .authorized, .provisional:
                Logger.info("Notification permission already granted")
                return true
            case .denied:
                Logger.warning("Notification permission denied")
                return false
            case .notDetermined:
                let granted = try await UNUserNotificationCenter.current().requestAuthorization(
                    options: [.alert, .badge, .sound]
                )
                Logger.info("Notification permission result: \(granted)")
                return granted
            @unknown default:
                return false
            }
        } catch {
            Logger.error("Error requesting notification permission: \(error.localizedDescription)")
            return false
        }
    }

    // MARK: - Topic Subscription
    func subscribeToTopic(_ topic: String) async throws {
        Logger.info("Subscribing to topic: \(topic)")

        do {
            try await Messaging.messaging().subscribe(toTopic: topic)
            Logger.info("Successfully subscribed to topic: \(topic)")
        } catch {
            Logger.error("Failed to subscribe to topic: \(error.localizedDescription)")
            throw AppError.unknown("Failed to subscribe to notifications")
        }
    }

    func unsubscribeFromTopic(_ topic: String) async throws {
        Logger.info("Unsubscribing from topic: \(topic)")

        do {
            try await Messaging.messaging().unsubscribe(fromTopic: topic)
            Logger.info("Successfully unsubscribed from topic: \(topic)")
        } catch {
            Logger.error("Failed to unsubscribe from topic: \(error.localizedDescription)")
            throw AppError.unknown("Failed to unsubscribe from notifications")
        }
    }

    // MARK: - Get FCM Token
    func getFCMToken() async throws -> String {
        Logger.info("Getting FCM token")

        do {
            let token = try await Messaging.messaging().token()
            Logger.info("FCM token retrieved: \(token.prefix(20))...")
            return token
        } catch {
            Logger.error("Failed to get FCM token: \(error.localizedDescription)")
            throw AppError.unknown("Failed to get notification token")
        }
    }

    // MARK: - Token Refresh Observer
    private func setupTokenRefreshObserver() {
        NotificationCenter.default.addObserver(
            forName: .fcmTokenDidRefresh,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let token = notification.userInfo?["token"] as? String else { return }
            self?.handleTokenRefresh(token)
        }
    }

    private func handleTokenRefresh(_ token: String) {
        Logger.info("FCM token refreshed")

        // Save token locally
        UserDefaults.standard.set(token, forKey: Constants.UserDefaultsKeys.fcmToken)

        // Update token in Firestore if user is logged in
        Task {
            guard let userId = AuthService.shared.currentUserId else { return }

            do {
                try await CustomerService.shared.updateFCMToken(customerId: userId, token: token)
            } catch {
                Logger.error("Failed to update FCM token in Firestore: \(error.localizedDescription)")
            }
        }
    }
}

// MARK: - Local Notification Helpers
extension NotificationService {

    func scheduleLocalNotification(
        title: String,
        body: String,
        date: Date,
        identifier: String
    ) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: date)
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)

        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                Logger.error("Failed to schedule local notification: \(error.localizedDescription)")
            } else {
                Logger.info("Local notification scheduled: \(identifier)")
            }
        }
    }

    func cancelLocalNotification(identifier: String) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
        Logger.info("Cancelled local notification: \(identifier)")
    }

    func cancelAllLocalNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        Logger.info("Cancelled all local notifications")
    }

    func clearBadge() {
        UNUserNotificationCenter.current().setBadgeCount(0) { error in
            if let error = error {
                Logger.error("Failed to clear badge: \(error.localizedDescription)")
            }
        }
    }
}

// MARK: - Mock Service for Previews
#if DEBUG
final class MockNotificationService: NotificationServiceProtocol {
    var fcmToken: String? { "mock_fcm_token_12345" }

    func requestPermission() async -> Bool {
        try? await Task.sleep(nanoseconds: 500_000_000)
        return true
    }

    func subscribeToTopic(_ topic: String) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }

    func unsubscribeFromTopic(_ topic: String) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }

    func getFCMToken() async throws -> String {
        try await Task.sleep(nanoseconds: 500_000_000)
        return "mock_fcm_token_12345"
    }
}
#endif
