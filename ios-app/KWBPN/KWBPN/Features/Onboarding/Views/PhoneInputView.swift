//
//  PhoneInputView.swift
//  KWBPN
//
//  Phone number input for OTP authentication
//

import SwiftUI

struct PhoneInputView: View {

    // MARK: - Properties
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isPhoneFieldFocused: Bool

    // MARK: - Body
    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 32) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Enter your phone number")
                            .font(.title2)
                            .fontWeight(.bold)

                        Text("We'll send you a verification code via SMS")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }

                    // Phone Input
                    PhoneTextField(
                        phoneNumber: $viewModel.phoneNumber,
                        isDisabled: viewModel.isLoading,
                        errorMessage: viewModel.phoneError
                    )
                    .focused($isPhoneFieldFocused)

                    // Info Box
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.info)

                        Text("We use your phone number to verify your identity and send pickup notifications. Your number will not be shared with third parties.")
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

            // Continue Button
            VStack {
                PrimaryButton(
                    title: "Send Verification Code",
                    isLoading: viewModel.isLoading,
                    isDisabled: !viewModel.isPhoneNumberValid
                ) {
                    Task {
                        await viewModel.sendOTP()
                    }
                }
            }
            .padding(24)
            .background(Color.background)
        }
        .background(Color.background)
        .navigationBarTitleDisplayMode(.inline)
        .onTapToDismissKeyboard()
        .onAppear {
            isPhoneFieldFocused = true
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

// MARK: - Preview
#Preview {
    NavigationStack {
        PhoneInputView(viewModel: OnboardingViewModel())
    }
}
