//
//  NotificationDetailViewModel.swift
//  KWBPN
//
//  Manages notification detail screen state
//

import SwiftUI

@MainActor
final class NotificationDetailViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published private(set) var notification: PickupNotification?
    @Published private(set) var userResponse: PickupResponse?
    @Published private(set) var isLoading = false
    @Published private(set) var isSubmittingResponse = false
    @Published private(set) var error: AppError?

    // MARK: - Private Properties
    private var customer: Customer?
    private let notificationService: PickupNotificationServiceProtocol
    private let responseService: ResponseServiceProtocol

    // MARK: - Initialization
    init(
        notificationService: PickupNotificationServiceProtocol? = nil,
        responseService: ResponseServiceProtocol? = nil
    ) {
        // Use demo services if demo mode is enabled
        if DemoConfig.isEnabled {
            self.notificationService = notificationService ?? DemoPickupNotificationService.shared
            self.responseService = responseService ?? DemoResponseService.shared
        } else {
            self.notificationService = notificationService ?? PickupNotificationService.shared
            self.responseService = responseService ?? ResponseService.shared
        }
    }

    // MARK: - Public Methods
    func setCustomer(_ customer: Customer) {
        self.customer = customer
    }

    func loadNotification(id: String) async {
        guard let customer = customer else {
            Logger.warning("No customer set")
            return
        }

        isLoading = true
        error = nil

        do {
            // Fetch notification
            notification = try await notificationService.fetchNotification(id: id)

            // Fetch user's response
            if let notification = notification {
                userResponse = try await responseService.fetchResponse(
                    notificationId: notification.id,
                    customerId: customer.id
                )
            }

            Logger.info("Loaded notification: \(id)")
        } catch {
            Logger.error("Failed to load notification: \(error.localizedDescription)")
            self.error = AppError(error)
        }

        isLoading = false
    }

    func submitResponse(_ response: Constants.ResponseType) async {
        guard let customer = customer,
              let notification = notification else {
            Logger.warning("Cannot submit response - missing customer or notification")
            return
        }

        isSubmittingResponse = true

        do {
            let pickupResponse = try await responseService.submitResponse(
                notificationId: notification.id,
                customer: customer,
                response: response
            )

            userResponse = pickupResponse
            Haptics.success()

            Logger.info("Response submitted: \(response.rawValue)")
        } catch {
            Logger.error("Failed to submit response: \(error.localizedDescription)")
            self.error = AppError(error)
            Haptics.error()
        }

        isSubmittingResponse = false
    }
}
