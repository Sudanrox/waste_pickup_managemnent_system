//
//  HomeViewModel.swift
//  KWBPN
//
//  Manages home screen state and data
//

import SwiftUI
import Combine

@MainActor
final class HomeViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published private(set) var notifications: [PickupNotification] = []
    @Published private(set) var responses: [String: PickupResponse] = [:] // notificationId -> response
    @Published private(set) var isLoading = false
    @Published private(set) var isSubmittingResponse = false
    @Published private(set) var error: AppError?

    // MARK: - Private Properties
    private var customer: Customer?
    private var cancellables = Set<AnyCancellable>()
    private let notificationService: PickupNotificationServiceProtocol
    private let responseService: ResponseServiceProtocol

    // MARK: - Computed Properties
    var latestNotification: PickupNotification? {
        notifications.first { $0.status == .sent }
    }

    var upcomingNotifications: [PickupNotification] {
        Array(notifications.filter { $0.id != latestNotification?.id }.prefix(3))
    }

    var userResponse: PickupResponse? {
        guard let notification = latestNotification else { return nil }
        return responses[notification.id]
    }

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

    func loadNotifications() async {
        guard let customer = customer else {
            Logger.warning("No customer set, cannot load notifications")
            return
        }

        isLoading = true
        error = nil

        do {
            // Fetch notifications for customer's ward
            let fetchedNotifications = try await notificationService.fetchNotifications(
                forWard: customer.wardNumber,
                limit: 10
            )
            notifications = fetchedNotifications

            // Fetch user's responses for these notifications
            await loadResponses(for: fetchedNotifications)

            Logger.info("Loaded \(notifications.count) notifications for ward \(customer.wardNumber)")
        } catch {
            Logger.error("Failed to load notifications: \(error.localizedDescription)")
            self.error = AppError(error)
        }

        isLoading = false
    }

    func refresh() async {
        await loadNotifications()
    }

    func submitResponse(_ response: Constants.ResponseType, for notification: PickupNotification) async {
        guard let customer = customer else {
            Logger.warning("No customer set, cannot submit response")
            return
        }

        isSubmittingResponse = true

        do {
            let pickupResponse = try await responseService.submitResponse(
                notificationId: notification.id,
                customer: customer,
                response: response
            )

            // Update local state
            responses[notification.id] = pickupResponse

            // Haptic feedback
            Haptics.success()

            Logger.info("Response submitted: \(response.rawValue) for notification \(notification.id)")
        } catch {
            Logger.error("Failed to submit response: \(error.localizedDescription)")
            self.error = AppError(error)

            // Haptic feedback
            Haptics.error()
        }

        isSubmittingResponse = false
    }

    // MARK: - Private Methods
    private func loadResponses(for notifications: [PickupNotification]) async {
        guard let customer = customer else { return }

        for notification in notifications {
            do {
                if let response = try await responseService.fetchResponse(
                    notificationId: notification.id,
                    customerId: customer.id
                ) {
                    responses[notification.id] = response
                }
            } catch {
                Logger.error("Failed to fetch response for \(notification.id): \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Real-time Updates (Optional)
    func startObservingNotifications() {
        guard let customer = customer else { return }

        notificationService.observeNotifications(forWard: customer.wardNumber)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] notifications in
                self?.notifications = notifications
                Task {
                    await self?.loadResponses(for: notifications)
                }
            }
            .store(in: &cancellables)
    }

    func stopObserving() {
        cancellables.removeAll()
    }
}

// MARK: - Haptics Helper
enum Haptics {
    static func success() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }

    static func error() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.error)
    }

    static func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }

    static func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
}
