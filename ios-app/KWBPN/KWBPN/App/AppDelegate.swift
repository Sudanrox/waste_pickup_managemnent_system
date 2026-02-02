//
//  AppDelegate.swift
//  KWBPN
//
//  Handles Firebase initialization and Push Notifications
//

import UIKit
import FirebaseCore
import FirebaseMessaging
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Configure Firebase
        FirebaseApp.configure()

        // Setup push notifications
        setupPushNotifications(application)

        // Set messaging delegate
        Messaging.messaging().delegate = self

        return true
    }

    // MARK: - Push Notification Setup
    private func setupPushNotifications(_ application: UIApplication) {
        UNUserNotificationCenter.current().delegate = self

        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
        UNUserNotificationCenter.current().requestAuthorization(
            options: authOptions
        ) { granted, error in
            if let error = error {
                Logger.error("Push notification authorization error: \(error.localizedDescription)")
                return
            }
            Logger.info("Push notification permission granted: \(granted)")
        }

        application.registerForRemoteNotifications()
    }

    // MARK: - APNs Token Registration
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Messaging.messaging().apnsToken = deviceToken
        Logger.info("APNs token registered successfully")
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        Logger.error("Failed to register for remote notifications: \(error.localizedDescription)")
    }
}

// MARK: - UNUserNotificationCenterDelegate
extension AppDelegate: UNUserNotificationCenterDelegate {

    // Called when notification is received while app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        let userInfo = notification.request.content.userInfo
        Logger.info("Notification received in foreground: \(userInfo)")

        // Show banner even when app is in foreground
        completionHandler([.banner, .badge, .sound])
    }

    // Called when user taps on notification
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        Logger.info("User tapped notification: \(userInfo)")

        // Handle notification tap - navigate to detail
        if let notificationId = userInfo["notificationId"] as? String {
            NotificationCenter.default.post(
                name: .didTapPushNotification,
                object: nil,
                userInfo: ["notificationId": notificationId]
            )
        }

        completionHandler()
    }
}

// MARK: - MessagingDelegate
extension AppDelegate: MessagingDelegate {

    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let token = fcmToken else { return }
        Logger.info("FCM token received: \(token.prefix(20))...")

        // Post notification so services can update token in Firestore
        NotificationCenter.default.post(
            name: .fcmTokenDidRefresh,
            object: nil,
            userInfo: ["token": token]
        )
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let fcmTokenDidRefresh = Notification.Name("fcmTokenDidRefresh")
    static let didTapPushNotification = Notification.Name("didTapPushNotification")
}
