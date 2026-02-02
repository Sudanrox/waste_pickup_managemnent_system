//
//  OTPVerificationView.swift
//  KWBPN
//
//  OTP verification screen
//

import SwiftUI

struct OTPVerificationView: View {

    // MARK: - Properties
    @ObservedObject var viewModel: OnboardingViewModel
    @FocusState private var isOTPFieldFocused: Bool
    @State private var resendCountdown = 30

    // MARK: - Timer
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    // MARK: - Body
    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 32) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Verify your number")
                            .font(.title2)
                            .fontWeight(.bold)

                        Text("Enter the 6-digit code sent to")
                            .font(.body)
                            .foregroundColor(.secondary)

                        Text(viewModel.phoneNumber.phoneNumberWithCountryCode)
                            .font(.body)
                            .fontWeight(.semibold)
                    }

                    // OTP Input
                    VStack(alignment: .leading, spacing: 16) {
                        OTPTextField(
                            otp: $viewModel.otpCode,
                            isDisabled: viewModel.isLoading,
                            errorMessage: viewModel.otpError
                        )
                        .focused($isOTPFieldFocused)
                        .onChange(of: viewModel.otpCode) { _, newValue in
                            // Auto-submit when 6 digits entered
                            if newValue.count == Constants.Validation.otpLength {
                                Task {
                                    await viewModel.verifyOTP()
                                }
                            }
                        }
                    }

                    // Resend Code
                    HStack {
                        Text("Didn't receive the code?")
                            .font(.subheadline)
                            .foregroundColor(.secondary)

                        if resendCountdown > 0 {
                            Text("Resend in \(resendCountdown)s")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        } else {
                            Button("Resend Code") {
                                Task {
                                    await viewModel.resendOTP()
                                    resendCountdown = 30
                                }
                            }
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .disabled(viewModel.isLoading)
                        }
                    }

                    // Change Number
                    Button {
                        viewModel.goBack()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "pencil")
                            Text("Change phone number")
                        }
                        .font(.subheadline)
                        .foregroundColor(.accentColor)
                    }
                    .disabled(viewModel.isLoading)

                    Spacer()
                }
                .padding(24)
            }

            // Verify Button
            VStack {
                PrimaryButton(
                    title: "Verify",
                    isLoading: viewModel.isLoading,
                    isDisabled: !viewModel.isOTPValid
                ) {
                    Task {
                        await viewModel.verifyOTP()
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
            isOTPFieldFocused = true
            resendCountdown = 30
        }
        .onReceive(timer) { _ in
            if resendCountdown > 0 {
                resendCountdown -= 1
            }
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
        OTPVerificationView(viewModel: {
            let vm = OnboardingViewModel()
            vm.phoneNumber = "9841234567"
            return vm
        }())
    }
}
