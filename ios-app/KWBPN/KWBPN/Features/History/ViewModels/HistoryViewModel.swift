//
//  HistoryViewModel.swift
//  KWBPN
//
//  Manages history screen state
//

import SwiftUI

@MainActor
final class HistoryViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published private(set) var notifications: [PickupNotification] = []
    @Published private(set) var responses: [String: PickupResponse] = [:]
    @Published private(set) var isLoading = false
    @Published private(set) var error: AppError?

    // MARK: - Private Properties
    private var customer: Customer?
    private let notificationService: PickupNotificationServiceProtocol
    private let responseService: ResponseServiceProtocol

    // MARK: - Initialization
    init(
        notificationService: PickupNotificationServiceProtocol = PickupNotificationService.shared,
        responseService: ResponseServiceProtocol = ResponseService.shared
    ) {
        self.notificationService = notificationService
        self.responseService = responseService
    }

    // MARK: - Public Methods
    func setCustomer(_ customer: Customer) {
        self.customer = customer
    }

    func loadHistory() async {
        guard let customer = customer else {
            Logger.warning("No customer set")
            return
        }

        isLoading = true
        error = nil

        do {
            // Fetch all notifications for ward
            notifications = try await notificationService.fetchNotifications(
                forWard: customer.wardNumber,
                limit: 50
            )

            // Fetch user's responses
            let userResponses = try await responseService.fetchResponses(
                forCustomer: customer.id,
                limit: 50
            )

            // Map responses by notification ID
            responses = Dictionary(
                uniqueKeysWithValues: userResponses.map { ($0.notificationId, $0) }
            )

            Logger.info("Loaded \(notifications.count) notifications, \(responses.count) responses")
        } catch {
            Logger.error("Failed to load history: \(error.localizedDescription)")
            self.error = AppError(error)
        }

        isLoading = false
    }

    func refresh() async {
        await loadHistory()
    }
}
