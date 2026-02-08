//
//  LanguageSettingsViewModel.swift
//  KWBPN
//
//  ViewModel for language settings management
//

import SwiftUI

@MainActor
final class LanguageSettingsViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published var selectedLanguage: AppLanguage
    @Published var isUpdating = false
    @Published var showSuccess = false
    @Published var error: String?

    // MARK: - Private Properties
    private let appState: AppState

    // MARK: - Initialization
    init(appState: AppState) {
        self.appState = appState
        self.selectedLanguage = appState.currentCustomer?.appLanguage ?? .nepali
    }

    // MARK: - Public Methods
    func selectLanguage(_ language: AppLanguage) {
        guard language != selectedLanguage else { return }

        isUpdating = true
        error = nil

        // Update via AppState (handles both UserDefaults and Firestore)
        appState.setLanguage(language)
        selectedLanguage = language

        // Show success feedback
        isUpdating = false
        showSuccess = true

        // Haptic feedback
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()

        // Auto-dismiss success after delay
        Task {
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            showSuccess = false
        }
    }
}
