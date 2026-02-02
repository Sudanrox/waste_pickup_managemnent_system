//
//  AppState.swift
//  KWBPN
//
//  Global application state management
//

import SwiftUI
import FirebaseAuth
import Combine

// MARK: - Auth State Enum
enum AuthState: Equatable {
    case loading
    case unauthenticated
    case needsProfile
    case authenticated
}

// MARK: - App State
@MainActor
final class AppState: ObservableObject {

    // MARK: - Published Properties
    @Published private(set) var authState: AuthState = .loading
    @Published private(set) var currentCustomer: Customer?
    @Published var colorScheme: ColorScheme? = nil

    // MARK: - Private Properties
    private var authStateListener: AuthStateDidChangeListenerHandle?
    private var cancellables = Set<AnyCancellable>()
    private let authService: AuthServiceProtocol
    private let customerService: CustomerServiceProtocol

    // MARK: - Initialization
    init(
        authService: AuthServiceProtocol = AuthService.shared,
        customerService: CustomerServiceProtocol = CustomerService.shared
    ) {
        self.authService = authService
        self.customerService = customerService
        setupAuthStateListener()
        loadUserPreferences()
    }

    deinit {
        if let listener = authStateListener {
            Auth.auth().removeStateDidChangeListener(listener)
        }
    }

    // MARK: - Auth State Listener
    private func setupAuthStateListener() {
        authStateListener = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                await self?.handleAuthStateChange(user: user)
            }
        }
    }

    private func handleAuthStateChange(user: FirebaseAuth.User?) async {
        guard let user = user else {
            authState = .unauthenticated
            currentCustomer = nil
            return
        }

        do {
            // Try to fetch existing customer profile
            if let customer = try await customerService.fetchCustomer(userId: user.uid) {
                currentCustomer = customer
                authState = .authenticated
            } else {
                // User is authenticated but has no profile
                authState = .needsProfile
            }
        } catch {
            Logger.error("Error fetching customer: \(error.localizedDescription)")
            authState = .needsProfile
        }
    }

    // MARK: - Public Methods
    func updateCustomer(_ customer: Customer) {
        currentCustomer = customer
        authState = .authenticated
    }

    func signOut() {
        do {
            try authService.signOut()
            currentCustomer = nil
            authState = .unauthenticated
        } catch {
            Logger.error("Sign out error: \(error.localizedDescription)")
        }
    }

    func refreshCustomer() async {
        guard let userId = Auth.auth().currentUser?.uid else { return }

        do {
            if let customer = try await customerService.fetchCustomer(userId: userId) {
                currentCustomer = customer
            }
        } catch {
            Logger.error("Error refreshing customer: \(error.localizedDescription)")
        }
    }

    // MARK: - User Preferences
    private func loadUserPreferences() {
        // Load saved language preference
        if let languageCode = UserDefaults.standard.string(forKey: Constants.UserDefaultsKeys.language) {
            // Apply language setting if needed
            Logger.info("Loaded language preference: \(languageCode)")
        }
    }

    func setLanguage(_ language: AppLanguage) {
        UserDefaults.standard.set(language.code, forKey: Constants.UserDefaultsKeys.language)

        // Update current customer's language preference in Firestore
        if let customer = currentCustomer {
            Task {
                do {
                    try await customerService.updateLanguage(
                        customerId: customer.id,
                        language: language.code
                    )
                } catch {
                    Logger.error("Failed to update language: \(error.localizedDescription)")
                }
            }
        }
    }
}

// MARK: - App Language
enum AppLanguage: String, CaseIterable {
    case english = "en"
    case nepali = "ne"

    var code: String { rawValue }

    var displayName: String {
        switch self {
        case .english: return "English"
        case .nepali: return "नेपाली"
        }
    }
}
