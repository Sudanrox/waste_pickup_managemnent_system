//
//  OnboardingViewModel.swift
//  KWBPN
//
//  Handles phone OTP authentication flow
//

import SwiftUI

@MainActor
final class OnboardingViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published var navigationPath = NavigationPath()
    @Published var phoneNumber: String = ""
    @Published var otpCode: String = ""
    @Published var isLoading = false
    @Published var phoneError: String?
    @Published var otpError: String?
    @Published var alertItem: AlertItem?

    // MARK: - Private Properties
    private var verificationId: String?
    private let authService: AuthServiceProtocol

    // MARK: - Initialization
    init(authService: AuthServiceProtocol = AuthService.shared) {
        self.authService = authService
    }

    // MARK: - Computed Properties
    var isPhoneNumberValid: Bool {
        phoneNumber.count == Constants.Validation.phoneNumberLength &&
        phoneNumber.isValidNepaliPhoneNumber
    }

    var isOTPValid: Bool {
        otpCode.count == Constants.Validation.otpLength
    }

    // MARK: - Navigation
    func navigateTo(_ step: OnboardingStep) {
        navigationPath.append(step)
    }

    func goBack() {
        guard !navigationPath.isEmpty else { return }
        navigationPath.removeLast()
    }

    // MARK: - Send OTP
    func sendOTP() async {
        phoneError = nil

        // Validate phone number
        guard isPhoneNumberValid else {
            phoneError = "Please enter a valid 10-digit phone number"
            return
        }

        isLoading = true
        defer { isLoading = false }

        do {
            let id = try await authService.sendOTP(to: phoneNumber)
            verificationId = id
            Logger.info("OTP sent successfully")

            // Navigate to OTP screen
            navigateTo(.otpVerification)

        } catch let error as AppError {
            Logger.error("Failed to send OTP: \(error.localizedDescription)")
            phoneError = error.errorDescription
        } catch {
            Logger.error("Unexpected error sending OTP: \(error.localizedDescription)")
            phoneError = "Failed to send verification code. Please try again."
        }
    }

    // MARK: - Verify OTP
    func verifyOTP() async {
        otpError = nil

        // Validate OTP
        guard isOTPValid else {
            otpError = "Please enter a valid 6-digit code"
            return
        }

        guard let verificationId = verificationId else {
            otpError = "Verification session expired. Please request a new code."
            return
        }

        isLoading = true
        defer { isLoading = false }

        do {
            let user = try await authService.verifyOTP(verificationId: verificationId, code: otpCode)
            Logger.info("OTP verified successfully for user: \(user.uid)")

            // AppState will automatically handle the auth state change
            // and navigate to ProfileSetup or Home based on whether
            // the customer profile exists

        } catch let error as AppError {
            Logger.error("Failed to verify OTP: \(error.localizedDescription)")
            otpError = error.errorDescription

            // Clear OTP on error
            otpCode = ""

        } catch {
            Logger.error("Unexpected error verifying OTP: \(error.localizedDescription)")
            otpError = "Verification failed. Please try again."
            otpCode = ""
        }
    }

    // MARK: - Resend OTP
    func resendOTP() async {
        otpError = nil
        otpCode = ""

        isLoading = true
        defer { isLoading = false }

        do {
            let id = try await authService.sendOTP(to: phoneNumber)
            verificationId = id
            Logger.info("OTP resent successfully")

            alertItem = AlertItem(
                title: "Code Sent",
                message: "A new verification code has been sent to your phone."
            )

        } catch let error as AppError {
            Logger.error("Failed to resend OTP: \(error.localizedDescription)")
            alertItem = AlertItem(error: error)
        } catch {
            Logger.error("Unexpected error resending OTP: \(error.localizedDescription)")
            alertItem = AlertItem(
                title: "Error",
                message: "Failed to resend code. Please try again."
            )
        }
    }

    // MARK: - Reset
    func reset() {
        navigationPath = NavigationPath()
        phoneNumber = ""
        otpCode = ""
        verificationId = nil
        phoneError = nil
        otpError = nil
        isLoading = false
    }
}
