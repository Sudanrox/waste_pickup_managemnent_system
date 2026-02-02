//
//  CustomerService.swift
//  KWBPN
//
//  Customer CRUD operations with Firestore
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

// MARK: - Protocol
protocol CustomerServiceProtocol {
    func fetchCustomer(userId: String) async throws -> Customer?
    func createCustomer(_ customer: Customer) async throws
    func updateCustomer(_ customer: Customer) async throws
    func updateFCMToken(customerId: String, token: String) async throws
    func updateWard(customerId: String, wardId: String, wardNumber: Int) async throws
    func updateLanguage(customerId: String, language: String) async throws
}

// MARK: - Implementation
final class CustomerService: CustomerServiceProtocol {

    // MARK: - Singleton
    static let shared = CustomerService()

    // MARK: - Properties
    private let db = Firestore.firestore()
    private var collectionRef: CollectionReference {
        db.collection(Constants.FirestoreCollection.customers)
    }

    // MARK: - Initialization
    private init() {
        // Enable offline persistence
        let settings = FirestoreSettings()
        settings.cacheSettings = PersistentCacheSettings(sizeBytes: 100_000_000)
        db.settings = settings
    }

    // MARK: - Fetch Customer
    func fetchCustomer(userId: String) async throws -> Customer? {
        Logger.info("Fetching customer: \(userId)")

        do {
            let document = try await collectionRef.document(userId).getDocument()

            guard document.exists else {
                Logger.info("Customer not found: \(userId)")
                return nil
            }

            guard let customer = Customer(document: document) else {
                Logger.error("Failed to parse customer document")
                throw AppError.parseFailed
            }

            Logger.info("Customer fetched successfully: \(customer.name)")
            return customer
        } catch {
            Logger.error("Error fetching customer: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Create Customer
    func createCustomer(_ customer: Customer) async throws {
        Logger.info("Creating customer: \(customer.id)")

        // Validate customer data
        guard customer.name.isValidName else {
            throw AppError.invalidName
        }

        guard customer.wardNumber >= 1 && customer.wardNumber <= Constants.Validation.totalWards else {
            throw AppError.invalidWard
        }

        do {
            try await collectionRef.document(customer.id).setData(customer.toDictionary())
            Logger.info("Customer created successfully")

            // Subscribe to ward FCM topic
            await subscribeToWardTopic(wardNumber: customer.wardNumber)
        } catch {
            Logger.error("Error creating customer: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Update Customer
    func updateCustomer(_ customer: Customer) async throws {
        Logger.info("Updating customer: \(customer.id)")

        var updateData = customer.toDictionary()
        updateData["updatedAt"] = FieldValue.serverTimestamp()

        do {
            try await collectionRef.document(customer.id).updateData(updateData)
            Logger.info("Customer updated successfully")
        } catch {
            Logger.error("Error updating customer: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Update FCM Token
    func updateFCMToken(customerId: String, token: String) async throws {
        Logger.info("Updating FCM token for customer: \(customerId)")

        do {
            try await collectionRef.document(customerId).updateData([
                "fcmToken": token,
                "updatedAt": FieldValue.serverTimestamp()
            ])
            Logger.info("FCM token updated successfully")
        } catch {
            Logger.error("Error updating FCM token: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Update Ward
    func updateWard(customerId: String, wardId: String, wardNumber: Int) async throws {
        Logger.info("Updating ward for customer: \(customerId) to ward \(wardNumber)")

        // Get current ward to unsubscribe from old topic
        if let currentCustomer = try await fetchCustomer(userId: customerId) {
            await unsubscribeFromWardTopic(wardNumber: currentCustomer.wardNumber)
        }

        do {
            try await collectionRef.document(customerId).updateData([
                "wardId": wardId,
                "wardNumber": wardNumber,
                "updatedAt": FieldValue.serverTimestamp()
            ])

            // Subscribe to new ward topic
            await subscribeToWardTopic(wardNumber: wardNumber)
            Logger.info("Ward updated successfully")
        } catch {
            Logger.error("Error updating ward: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Update Language
    func updateLanguage(customerId: String, language: String) async throws {
        Logger.info("Updating language for customer: \(customerId) to \(language)")

        do {
            try await collectionRef.document(customerId).updateData([
                "language": language,
                "updatedAt": FieldValue.serverTimestamp()
            ])
            Logger.info("Language updated successfully")
        } catch {
            Logger.error("Error updating language: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - FCM Topic Management
    private func subscribeToWardTopic(wardNumber: Int) async {
        let topic = Constants.FCMTopic.ward(wardNumber)
        Logger.info("Subscribing to FCM topic: \(topic)")

        do {
            try await FirebaseMessaging.Messaging.messaging().subscribe(toTopic: topic)
            Logger.info("Subscribed to topic: \(topic)")
        } catch {
            Logger.error("Failed to subscribe to topic: \(error.localizedDescription)")
        }
    }

    private func unsubscribeFromWardTopic(wardNumber: Int) async {
        let topic = Constants.FCMTopic.ward(wardNumber)
        Logger.info("Unsubscribing from FCM topic: \(topic)")

        do {
            try await FirebaseMessaging.Messaging.messaging().unsubscribe(fromTopic: topic)
            Logger.info("Unsubscribed from topic: \(topic)")
        } catch {
            Logger.error("Failed to unsubscribe from topic: \(error.localizedDescription)")
        }
    }
}

// MARK: - Firebase Messaging Import
import FirebaseMessaging

// MARK: - Mock Service for Previews
#if DEBUG
final class MockCustomerService: CustomerServiceProtocol {
    func fetchCustomer(userId: String) async throws -> Customer? {
        try await Task.sleep(nanoseconds: 500_000_000)
        return Customer.mock
    }

    func createCustomer(_ customer: Customer) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }

    func updateCustomer(_ customer: Customer) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }

    func updateFCMToken(customerId: String, token: String) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }

    func updateWard(customerId: String, wardId: String, wardNumber: Int) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }

    func updateLanguage(customerId: String, language: String) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
    }
}
#endif
