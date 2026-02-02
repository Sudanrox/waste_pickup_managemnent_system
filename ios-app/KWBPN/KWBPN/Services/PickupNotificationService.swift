//
//  PickupNotificationService.swift
//  KWBPN
//
//  Pickup notification operations with Firestore
//

import Foundation
import FirebaseFirestore
import FirebaseAuth
import Combine

// MARK: - Protocol
protocol PickupNotificationServiceProtocol {
    func fetchNotifications(forWard wardNumber: Int, limit: Int) async throws -> [PickupNotification]
    func fetchNotification(id: String) async throws -> PickupNotification?
    func fetchLatestNotification(forWard wardNumber: Int) async throws -> PickupNotification?
    func observeNotifications(forWard wardNumber: Int) -> AnyPublisher<[PickupNotification], Never>
}

// MARK: - Implementation
final class PickupNotificationService: PickupNotificationServiceProtocol {

    // MARK: - Singleton
    static let shared = PickupNotificationService()

    // MARK: - Properties
    private let db = Firestore.firestore()
    private var collectionRef: CollectionReference {
        db.collection(Constants.FirestoreCollection.notifications)
    }

    // MARK: - Initialization
    private init() {}

    // MARK: - Fetch Notifications for Ward
    func fetchNotifications(forWard wardNumber: Int, limit: Int = 20) async throws -> [PickupNotification] {
        Logger.info("Fetching notifications for ward \(wardNumber), limit: \(limit)")

        // Get notifications from last 30 days
        let thirtyDaysAgo = Calendar.current.date(byAdding: .day, value: -30, to: Date()) ?? Date()

        do {
            let snapshot = try await collectionRef
                .whereField("wardNumber", isEqualTo: wardNumber)
                .whereField("scheduledDate", isGreaterThanOrEqualTo: Timestamp(date: thirtyDaysAgo))
                .order(by: "scheduledDate", descending: true)
                .limit(to: limit)
                .getDocuments()

            let notifications = snapshot.documents.compactMap { PickupNotification(document: $0) }
            Logger.info("Fetched \(notifications.count) notifications")
            return notifications
        } catch {
            Logger.error("Error fetching notifications: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Fetch Single Notification
    func fetchNotification(id: String) async throws -> PickupNotification? {
        Logger.info("Fetching notification: \(id)")

        do {
            let document = try await collectionRef.document(id).getDocument()

            guard document.exists else {
                Logger.info("Notification not found: \(id)")
                return nil
            }

            guard let notification = PickupNotification(document: document) else {
                Logger.error("Failed to parse notification document")
                throw AppError.parseFailed
            }

            Logger.info("Notification fetched successfully")
            return notification
        } catch {
            Logger.error("Error fetching notification: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Fetch Latest Notification
    func fetchLatestNotification(forWard wardNumber: Int) async throws -> PickupNotification? {
        Logger.info("Fetching latest notification for ward \(wardNumber)")

        do {
            let snapshot = try await collectionRef
                .whereField("wardNumber", isEqualTo: wardNumber)
                .whereField("status", isEqualTo: Constants.NotificationStatus.sent.rawValue)
                .order(by: "scheduledDate", descending: true)
                .limit(to: 1)
                .getDocuments()

            guard let document = snapshot.documents.first else {
                Logger.info("No active notification found for ward \(wardNumber)")
                return nil
            }

            let notification = PickupNotification(document: document)
            Logger.info("Latest notification fetched: \(notification?.id ?? "nil")")
            return notification
        } catch {
            Logger.error("Error fetching latest notification: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Real-time Observation
    func observeNotifications(forWard wardNumber: Int) -> AnyPublisher<[PickupNotification], Never> {
        let subject = CurrentValueSubject<[PickupNotification], Never>([])

        let thirtyDaysAgo = Calendar.current.date(byAdding: .day, value: -30, to: Date()) ?? Date()

        let listener = collectionRef
            .whereField("wardNumber", isEqualTo: wardNumber)
            .whereField("scheduledDate", isGreaterThanOrEqualTo: Timestamp(date: thirtyDaysAgo))
            .order(by: "scheduledDate", descending: true)
            .limit(to: 20)
            .addSnapshotListener { snapshot, error in
                if let error = error {
                    Logger.error("Snapshot listener error: \(error.localizedDescription)")
                    return
                }

                guard let snapshot = snapshot else { return }

                let notifications = snapshot.documents.compactMap { PickupNotification(document: $0) }
                Logger.info("Real-time update: \(notifications.count) notifications")

                // Check if data is from cache
                if snapshot.metadata.isFromCache {
                    Logger.info("Data is from local cache (offline)")
                }

                subject.send(notifications)
            }

        // Store listener reference to prevent premature deallocation
        // In real implementation, manage listener lifecycle properly

        return subject.eraseToAnyPublisher()
    }
}

// MARK: - Mock Service for Previews
#if DEBUG
final class MockPickupNotificationService: PickupNotificationServiceProtocol {
    func fetchNotifications(forWard wardNumber: Int, limit: Int) async throws -> [PickupNotification] {
        try await Task.sleep(nanoseconds: 500_000_000)
        return PickupNotification.mockList
    }

    func fetchNotification(id: String) async throws -> PickupNotification? {
        try await Task.sleep(nanoseconds: 500_000_000)
        return PickupNotification.mock
    }

    func fetchLatestNotification(forWard wardNumber: Int) async throws -> PickupNotification? {
        try await Task.sleep(nanoseconds: 500_000_000)
        return PickupNotification.mock
    }

    func observeNotifications(forWard wardNumber: Int) -> AnyPublisher<[PickupNotification], Never> {
        Just(PickupNotification.mockList).eraseToAnyPublisher()
    }
}
#endif
