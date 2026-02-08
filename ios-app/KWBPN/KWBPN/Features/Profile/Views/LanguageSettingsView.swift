//
//  LanguageSettingsView.swift
//  KWBPN
//
//  Language selection settings view
//

import SwiftUI

struct LanguageSettingsView: View {

    // MARK: - Properties
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel: LanguageSettingsViewModel

    // MARK: - Initialization
    init(appState: AppState? = nil) {
        // StateObject will be properly initialized in onAppear if appState is nil
        let state = appState ?? AppState()
        _viewModel = StateObject(wrappedValue: LanguageSettingsViewModel(appState: state))
    }

    // MARK: - Body
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Info Section
                infoSection

                // Language Options Section
                languageOptionsSection

                // Note Section
                noteSection
            }
            .padding()
        }
        .background(Color.background)
        .navigationTitle("Language")
        .navigationBarTitleDisplayMode(.large)
        .overlay {
            if viewModel.showSuccess {
                successOverlay
            }
        }
        .overlay {
            if viewModel.isUpdating {
                loadingOverlay
            }
        }
        .onAppear {
            // Sync with current customer's language
            if let customerLanguage = appState.currentCustomer?.appLanguage {
                if viewModel.selectedLanguage != customerLanguage {
                    viewModel.selectedLanguage = customerLanguage
                }
            }
        }
    }

    // MARK: - Info Section
    private var infoSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Language Preference")
                .font(.headline)
                .foregroundColor(.secondary)

            Text("Choose your preferred language for the app. This setting affects how notifications and messages are displayed.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - Language Options Section
    private var languageOptionsSection: some View {
        VStack(spacing: 0) {
            ForEach(AppLanguage.allCases, id: \.self) { language in
                languageRow(for: language)

                if language != AppLanguage.allCases.last {
                    Divider()
                        .padding(.leading, 52)
                }
            }
        }
        .background(Color.cardBackground)
        .cornerRadius(Constants.UI.cornerRadius)
    }

    // MARK: - Language Row
    private func languageRow(for language: AppLanguage) -> some View {
        Button {
            viewModel.selectLanguage(language)
        } label: {
            HStack(spacing: 16) {
                // Language icon
                Image(systemName: "globe")
                    .font(.title3)
                    .foregroundColor(.accentColor)
                    .frame(width: 28)

                // Language names
                VStack(alignment: .leading, spacing: 2) {
                    Text(language.displayName)
                        .font(.body)
                        .foregroundColor(.primary)

                    Text(languageSubtitle(for: language))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // Checkmark indicator
                if viewModel.selectedLanguage == language {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title2)
                        .foregroundColor(.accentColor)
                }
            }
            .padding()
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    // MARK: - Note Section
    private var noteSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "info.circle.fill")
                    .foregroundColor(.accentColor)

                Text("Note")
                    .font(.headline)
                    .foregroundColor(.secondary)
            }

            Text("Your language preference will be used for push notifications about waste pickup schedules. The change takes effect immediately.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.accentColor.opacity(0.1))
        .cornerRadius(Constants.UI.cornerRadius)
    }

    // MARK: - Success Overlay
    private var successOverlay: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
                .foregroundColor(.success)

            Text("Language Updated")
                .font(.headline)
                .foregroundColor(.primary)
        }
        .padding(32)
        .background(Color.cardBackground)
        .cornerRadius(Constants.UI.cornerRadius)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 4)
        .transition(.scale.combined(with: .opacity))
        .animation(.spring(response: 0.3), value: viewModel.showSuccess)
    }

    // MARK: - Loading Overlay
    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            ProgressView()
                .scaleEffect(1.5)
                .tint(.white)
        }
    }

    // MARK: - Helper Methods
    private func languageSubtitle(for language: AppLanguage) -> String {
        switch language {
        case .english:
            return "English"
        case .nepali:
            return "Nepali"
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        LanguageSettingsView()
            .environmentObject(AppState())
    }
}
