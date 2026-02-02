//
//  Router.swift
//  KWBPN
//
//  Navigation management
//

import SwiftUI

// MARK: - Route Enum
enum Route: Hashable {
    case home
    case notificationDetail(notificationId: String)
    case history
    case profile
    case editProfile
    case changeWard
    case languageSettings
}

// MARK: - Router
@MainActor
final class Router: ObservableObject {

    // MARK: - Published Properties
    @Published var path = NavigationPath()
    @Published var selectedTab: TabItem = .home
    @Published var presentedSheet: Sheet?
    @Published var presentedAlert: AlertItem?

    // MARK: - Sheet Types
    enum Sheet: Identifiable {
        case wardPicker
        case languagePicker
        case confirmLogout

        var id: String {
            switch self {
            case .wardPicker: return "wardPicker"
            case .languagePicker: return "languagePicker"
            case .confirmLogout: return "confirmLogout"
            }
        }
    }

    // MARK: - Tab Items
    enum TabItem: String, CaseIterable {
        case home
        case history
        case profile

        var title: String {
            switch self {
            case .home: return String(localized: "Home")
            case .history: return String(localized: "History")
            case .profile: return String(localized: "Profile")
            }
        }

        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .history: return "clock.fill"
            case .profile: return "person.fill"
            }
        }
    }

    // MARK: - Navigation Methods
    func navigate(to route: Route) {
        path.append(route)
    }

    func navigateBack() {
        guard !path.isEmpty else { return }
        path.removeLast()
    }

    func navigateToRoot() {
        path.removeLast(path.count)
    }

    func switchTab(to tab: TabItem) {
        selectedTab = tab
    }

    // MARK: - Sheet Methods
    func presentSheet(_ sheet: Sheet) {
        presentedSheet = sheet
    }

    func dismissSheet() {
        presentedSheet = nil
    }

    // MARK: - Alert Methods
    func showAlert(_ alert: AlertItem) {
        presentedAlert = alert
    }

    func showError(_ error: AppError, retryAction: (() -> Void)? = nil) {
        presentedAlert = AlertItem(error: error, retryAction: retryAction)
    }

    func dismissAlert() {
        presentedAlert = nil
    }

    // MARK: - Deep Link Handling
    func handleDeepLink(notificationId: String) {
        // Switch to home tab and navigate to notification detail
        selectedTab = .home
        navigateToRoot()

        // Small delay to ensure tab switch completes
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.navigate(to: .notificationDetail(notificationId: notificationId))
        }
    }
}

// MARK: - Deep Link Observer
final class DeepLinkHandler {

    static let shared = DeepLinkHandler()
    private var router: Router?

    private init() {
        setupObserver()
    }

    func setRouter(_ router: Router) {
        self.router = router
    }

    private func setupObserver() {
        NotificationCenter.default.addObserver(
            forName: .didTapPushNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let notificationId = notification.userInfo?["notificationId"] as? String else { return }
            self?.router?.handleDeepLink(notificationId: notificationId)
        }
    }
}
