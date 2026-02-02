//
//  ProfileSetupView.swift
//  KWBPN
//
//  Initial profile setup after authentication
//

import SwiftUI

struct ProfileSetupView: View {

    // MARK: - Properties
    @StateObject private var viewModel = ProfileSetupViewModel()
    @EnvironmentObject var appState: AppState
    @FocusState private var isNameFieldFocused: Bool

    // MARK: - Body
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 32) {
                        // Header
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Complete your profile")
                                .font(.title2)
                                .fontWeight(.bold)

                            Text("Tell us a bit about yourself so we can personalize your experience")
                                .font(.body)
                                .foregroundColor(.secondary)
                        }

                        // Name Input
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Full Name")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.secondary)

                            TextField("Enter your name", text: $viewModel.name)
                                .font(.body)
                                .textContentType(.name)
                                .autocapitalization(.words)
                                .focused($isNameFieldFocused)
                                .disabled(viewModel.isLoading)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .background(Color.secondaryBackground)
                                .cornerRadius(Constants.UI.cornerRadius)
                                .errorBorder(viewModel.nameError != nil)

                            if let error = viewModel.nameError {
                                Text(error)
                                    .font(.caption)
                                    .foregroundColor(.error)
                            }
                        }

                        // Ward Picker
                        WardPicker(
                            selectedWard: $viewModel.selectedWard,
                            label: "Your Ward",
                            isDisabled: viewModel.isLoading
                        )

                        if viewModel.wardError != nil {
                            Text(viewModel.wardError!)
                                .font(.caption)
                                .foregroundColor(.error)
                        }

                        // Info
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: "info.circle.fill")
                                .foregroundColor(.info)

                            Text("Select your ward number to receive pickup notifications specific to your area. You can change this later in settings.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(12)
                        .background(Color.info.opacity(0.1))
                        .cornerRadius(Constants.UI.cornerRadius)

                        Spacer()
                    }
                    .padding(24)
                }

                // Save Button
                VStack {
                    PrimaryButton(
                        title: "Complete Setup",
                        isLoading: viewModel.isLoading,
                        isDisabled: !viewModel.isFormValid
                    ) {
                        Task {
                            if let customer = await viewModel.createProfile() {
                                appState.updateCustomer(customer)
                            }
                        }
                    }
                }
                .padding(24)
                .background(Color.background)
            }
            .background(Color.background)
            .navigationTitle("Profile Setup")
            .navigationBarTitleDisplayMode(.inline)
            .onTapToDismissKeyboard()
            .onAppear {
                isNameFieldFocused = true
            }
            .alert(item: $viewModel.alertItem) { item in
                Alert(
                    title: Text(item.title),
                    message: Text(item.message),
                    dismissButton: .default(Text("OK"))
                )
            }
        }
    }
}

// MARK: - Profile Setup ViewModel
@MainActor
final class ProfileSetupViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published var name: String = ""
    @Published var selectedWard: Int?
    @Published var isLoading = false
    @Published var nameError: String?
    @Published var wardError: String?
    @Published var alertItem: AlertItem?

    // MARK: - Services
    private let authService: AuthServiceProtocol
    private let customerService: CustomerServiceProtocol
    private let notificationService: NotificationServiceProtocol

    // MARK: - Initialization
    init(
        authService: AuthServiceProtocol = AuthService.shared,
        customerService: CustomerServiceProtocol = CustomerService.shared,
        notificationService: NotificationServiceProtocol = NotificationService.shared
    ) {
        self.authService = authService
        self.customerService = customerService
        self.notificationService = notificationService
    }

    // MARK: - Computed Properties
    var isFormValid: Bool {
        name.trimmed.isValidName && selectedWard != nil
    }

    // MARK: - Methods
    func createProfile() async -> Customer? {
        // Validate
        nameError = nil
        wardError = nil

        guard name.trimmed.isValidName else {
            nameError = "Please enter a valid name (2-50 characters)"
            return nil
        }

        guard let ward = selectedWard,
              ward >= 1 && ward <= Constants.Validation.totalWards else {
            wardError = "Please select your ward"
            return nil
        }

        guard let userId = authService.currentUserId,
              let phoneNumber = authService.currentUser?.phoneNumber else {
            alertItem = AlertItem(title: "Error", message: "Authentication error. Please try again.")
            return nil
        }

        isLoading = true
        defer { isLoading = false }

        do {
            // Request notification permission
            let _ = await notificationService.requestPermission()

            // Get FCM token
            let fcmToken = try? await notificationService.getFCMToken()

            // Create customer
            let customer = Customer(
                id: userId,
                phoneNumber: phoneNumber,
                name: name.trimmed,
                wardId: "ward_\(ward)",
                wardNumber: ward,
                fcmToken: fcmToken,
                language: Locale.current.language.languageCode?.identifier ?? "ne"
            )

            try await customerService.createCustomer(customer)

            Logger.info("Profile created successfully for user: \(userId)")
            return customer

        } catch {
            Logger.error("Failed to create profile: \(error.localizedDescription)")
            alertItem = AlertItem(error: AppError(error))
            return nil
        }
    }
}

// MARK: - Preview
#Preview {
    ProfileSetupView()
        .environmentObject(AppState())
}
