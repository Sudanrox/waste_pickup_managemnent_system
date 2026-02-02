//
//  ResponseService.swift
//  KWBPN
//
//  Customer response operations with Firestore
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

// MARK: - Protocol
protocol ResponseServiceProtocol {
    func submitResponse(
        notificationId: String,
        customer: Customer,
        response: Constants.ResponseType
    ) async throws -> PickupResponse

    func fetchResponse(notificationId: String, customerId: String) async throws -> PickupResponse?
    func fetchResponses(forCustomer customerId: String, limit: Int) async throws -> [PickupResponse]
    func fetchResponsesForNotification(notificationId: String) async throws -> [PickupResponse]
}

// MARK: - Implementation
final class ResponseService: ResponseServiceProtocol {

    // MARK: - Singleton
    static let shared = ResponseService()

    // MARK: - Properties
    private let db = Firestore.firestore()
    private var collectionRef: CollectionReference {
        db.collection(Constants.FirestoreCollection.responses)
    }

    // MARK: - Initialization
    private init() {}

    // MARK: - Submit Response
    func submitResponse(
        notificationId: String,
        customer: Customer,
        response: Constants.ResponseType
    ) async throws -> PickupResponse {
        Logger.info("Submitting response: \(response.rawValue) for notification: \(notificationId)")

        // Create response object
        let pickupResponse = PickupResponse.create(
            for: notificationId,
            customer: customer,
            response: response
        )

        do {
            // Use set with merge to allow updates
            try await collectionRef.document(pickupResponse.id).setData(
                pickupResponse.toDictionary(),
                merge: true
            )

            Logger.info("Response submitted successfully: \(pickupResponse.id)")
            return pickupResponse
        } catch {
            Logger.error("Error submitting response: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Fetch Single Response
    func fetchResponse(notificationId: String, customerId: String) async throws -> PickupResponse? {
        let responseId = "\(notificationId)_\(customerId)"
        Logger.info("Fetching response: \(responseId)")

        do {
            let document = try await collectionRef.document(responseId).getDocument()

            guard document.exists else {
                Logger.info("Response not found: \(responseId)")
                return nil
            }

            guard let response = PickupResponse(document: document) else {
                Logger.error("Failed to parse response document")
                throw AppError.parseFailed
            }

            Logger.info("Response fetched: \(response.response.rawValue)")
            return response
        } catch {
            Logger.error("Error fetching response: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Fetch Customer's Responses
    func fetchResponses(forCustomer customerId: String, limit: Int = 50) async throws -> [PickupResponse] {
        Logger.info("Fetching responses for customer: \(customerId)")

        do {
            let snapshot = try await collectionRef
                .whereField("customerId", isEqualTo: customerId)
                .order(by: "respondedAt", descending: true)
                .limit(to: limit)
                .getDocuments()

            let responses = snapshot.documents.compactMap { PickupResponse(document: $0) }
            Logger.info("Fetched \(responses.count) responses for customer")
            return responses
        } catch {
            Logger.error("Error fetching customer responses: \(error.localizedDescription)")
            throw AppError(error)
        }
    }

    // MARK: - Fetch Responses for Notification (Admin use)
    func fetchResponsesForNotification(notificationId: String) async throws -> [PickupResponse] {
        Logger.info("Fetching responses for notification: \(notificationId)")

        do {
            let snapshot = try await collectionRef
                .whereField("notificationId", isEqualTo: notificationId)
                .order(by: "respondedAt", descending: true)
                .getDocuments()

            let responses = snapshot.documents.compactMap { PickupResponse(document: $0) }
            Logger.info("Fetched \(responses.count) responses for notification")
            return responses
        } catch {
            Logger.error("Error fetching notification responses: \(error.localizedDescription)")
            throw AppError(error)
        }
    }
}

// MARK: - Mock Service for Previews
#if DEBUG
final class MockResponseService: ResponseServiceProtocol {
    func submitResponse(
        notificationId: String,
        customer: Customer,
        response: Constants.ResponseType
    ) async throws -> PickupResponse {
        try await Task.sleep(nanoseconds: 500_000_000)
        return PickupResponse.create(for: notificationId, customer: customer, response: response)
    }

    func fetchResponse(notificationId: String, customerId: String) async throws -> PickupResponse? {
        try await Task.sleep(nanoseconds: 500_000_000)
        return PickupResponse.mock
    }

    func fetchResponses(forCustomer customerId: String, limit: Int) async throws -> [PickupResponse] {
        try await Task.sleep(nanoseconds: 500_000_000)
        return PickupResponse.mockList
    }

    func fetchResponsesForNotification(notificationId: String) async throws -> [PickupResponse] {
        try await Task.sleep(nanoseconds: 500_000_000)
        return PickupResponse.mockList
    }
}
#endif
