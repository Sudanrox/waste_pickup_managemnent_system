//
//  DemoServices.swift
//  KWBPN
//
//  Demo service implementations for testing without Firebase
//

import Foundation
import Combine

// MARK: - Demo Customer Service
final class DemoCustomerService: CustomerServiceProtocol {
    static let shared = DemoCustomerService()

    private var customer: Customer = DemoConfig.demoCustomer

    private init() {}

    func fetchCustomer(userId: String) async throws -> Customer? {
        try await Task.sleep(nanoseconds: 300_000_000)
        Logger.info("[DEMO] Fetched customer: \(customer.name)")
        return customer
    }

    func createCustomer(_ customer: Customer) async throws {
        try await Task.sleep(nanoseconds: 500_000_000)
        self.customer = customer
        Logger.info("[DEMO] Created customer: \(customer.name)")
    }

    func updateCustomer(_ customer: Customer) async throws {
        try await Task.sleep(nanoseconds: 300_000_000)
        self.customer = customer
        Logger.info("[DEMO] Updated customer: \(customer.name)")
    }

    func updateFCMToken(customerId: String, token: String) async throws {
        try await Task.sleep(nanoseconds: 200_000_000)
        Logger.info("[DEMO] Updated FCM token")
    }

    func updateWard(customerId: String, wardId: String, wardNumber: Int) async throws {
        try await Task.sleep(nanoseconds: 300_000_000)
        customer = Customer(
            id: customer.id,
            phoneNumber: customer.phoneNumber,
            name: customer.name,
            wardId: wardId,
            wardNumber: wardNumber,
            fcmToken: customer.fcmToken,
            language: customer.language,
            createdAt: customer.createdAt,
            updatedAt: Date(),
            isActive: customer.isActive
        )
        Logger.info("[DEMO] Updated ward to: \(wardNumber)")
    }

    func updateLanguage(customerId: String, language: String) async throws {
        try await Task.sleep(nanoseconds: 200_000_000)
        Logger.info("[DEMO] Updated language to: \(language)")
    }
}

// MARK: - Demo Pickup Notification Service
final class DemoPickupNotificationService: PickupNotificationServiceProtocol {
    static let shared = DemoPickupNotificationService()

    private var notifications: [PickupNotification] = DemoConfig.generateDemoNotifications()
    private let notificationsSubject = CurrentValueSubject<[PickupNotification], Never>([])

    private init() {
        notificationsSubject.send(notifications)
    }

    func fetchNotifications(forWard wardNumber: Int, limit: Int) async throws -> [PickupNotification] {
        try await Task.sleep(nanoseconds: 500_000_000)
        // In demo mode, return all notifications (they're already for ward 13)
        let filtered = notifications
        Logger.info("[DEMO] Fetched \(filtered.count) notifications for ward \(wardNumber)")
        return Array(filtered.prefix(limit))
    }

    func fetchNotification(id: String) async throws -> PickupNotification? {
        try await Task.sleep(nanoseconds: 300_000_000)
        let notification = notifications.first { $0.id == id }
        Logger.info("[DEMO] Fetched notification: \(notification?.id ?? "nil")")
        return notification
    }

    func fetchLatestNotification(forWard wardNumber: Int) async throws -> PickupNotification? {
        try await Task.sleep(nanoseconds: 300_000_000)
        let latest = notifications
            .filter { $0.status == .sent || $0.status == .scheduled }
            .first
        Logger.info("[DEMO] Latest notification: \(latest?.id ?? "nil")")
        return latest
    }

    func observeNotifications(forWard wardNumber: Int) -> AnyPublisher<[PickupNotification], Never> {
        Logger.info("[DEMO] Observing notifications for ward \(wardNumber)")
        return notificationsSubject.eraseToAnyPublisher()
    }
}

// MARK: - Demo Response Service
final class DemoResponseService: ResponseServiceProtocol {
    static let shared = DemoResponseService()

    private init() {}

    func submitResponse(
        notificationId: String,
        customer: Customer,
        response: Constants.ResponseType
    ) async throws -> PickupResponse {
        try await Task.sleep(nanoseconds: 800_000_000)

        let responseObj = PickupResponse.create(
            for: notificationId,
            customer: customer,
            response: response
        )

        DemoConfig.demoResponses[responseObj.id] = responseObj
        Logger.info("[DEMO] Submitted response: \(response.rawValue) for notification \(notificationId)")
        return responseObj
    }

    func fetchResponse(notificationId: String, customerId: String) async throws -> PickupResponse? {
        try await Task.sleep(nanoseconds: 200_000_000)
        let id = "\(notificationId)_\(customerId)"
        let response = DemoConfig.demoResponses[id]
        Logger.info("[DEMO] Fetched response: \(response?.response.rawValue ?? "nil")")
        return response
    }

    func fetchResponses(forCustomer customerId: String, limit: Int) async throws -> [PickupResponse] {
        try await Task.sleep(nanoseconds: 300_000_000)
        let responses = DemoConfig.demoResponses.values.filter { $0.customerId == customerId }
        Logger.info("[DEMO] Fetched \(responses.count) responses for customer")
        return Array(responses)
    }

    func fetchResponsesForNotification(notificationId: String) async throws -> [PickupResponse] {
        try await Task.sleep(nanoseconds: 300_000_000)
        let responses = DemoConfig.demoResponses.values.filter { $0.notificationId == notificationId }
        Logger.info("[DEMO] Fetched \(responses.count) responses for notification")
        return Array(responses)
    }
}
