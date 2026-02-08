//
//  AuthService.swift
//  KWBPN
//
//  Firebase Authentication service
//

import Foundation
import FirebaseAuth

// MARK: - Protocol
protocol AuthServiceProtocol {
    var currentUser: FirebaseAuth.User? { get }
    var currentUserId: String? { get }
    var isAuthenticated: Bool { get }

    func sendOTP(to phoneNumber: String) async throws -> String
    func verifyOTP(verificationId: String, code: String) async throws -> FirebaseAuth.User
    func signInWithEmail(email: String, password: String) async throws -> FirebaseAuth.User
    func signOut() throws
}

// MARK: - Implementation
final class AuthService: AuthServiceProtocol {

    // MARK: - Singleton
    static let shared = AuthService()

    // MARK: - Properties
    var currentUser: FirebaseAuth.User? {
        Auth.auth().currentUser
    }

    var currentUserId: String? {
        currentUser?.uid
    }

    var isAuthenticated: Bool {
        currentUser != nil
    }

    // MARK: - Initialization
    private init() {}

    // MARK: - OTP Methods
    func sendOTP(to phoneNumber: String) async throws -> String {
        Logger.info("Sending OTP to \(phoneNumber.maskedPhoneNumber)")

        // Validate phone number
        guard phoneNumber.phoneNumberWithoutCountryCode.isValidNepaliPhoneNumber else {
            throw AppError.invalidPhoneNumber
        }

        let fullPhoneNumber = phoneNumber.phoneNumberWithCountryCode

        do {
            let verificationId = try await PhoneAuthProvider.provider().verifyPhoneNumber(
                fullPhoneNumber,
                uiDelegate: nil
            )
            Logger.info("OTP sent successfully")
            return verificationId
        } catch {
            Logger.error("Failed to send OTP: \(error.localizedDescription)")
            throw mapAuthError(error)
        }
    }

    func verifyOTP(verificationId: String, code: String) async throws -> FirebaseAuth.User {
        Logger.info("Verifying OTP")

        // Validate OTP format
        guard code.isValidOTP else {
            throw AppError.invalidOTP
        }

        let credential = PhoneAuthProvider.provider().credential(
            withVerificationID: verificationId,
            verificationCode: code
        )

        do {
            let result = try await Auth.auth().signIn(with: credential)
            Logger.info("OTP verified successfully for user: \(result.user.uid)")
            return result.user
        } catch {
            Logger.error("OTP verification failed: \(error.localizedDescription)")
            throw mapAuthError(error)
        }
    }

    func signOut() throws {
        Logger.info("Signing out user")
        do {
            try Auth.auth().signOut()
            Logger.info("Sign out successful")
        } catch {
            Logger.error("Sign out failed: \(error.localizedDescription)")
            throw AppError.unknown(error.localizedDescription)
        }
    }

    // MARK: - Email/Password Auth (for Emulator Testing)
    func signInWithEmail(email: String, password: String) async throws -> FirebaseAuth.User {
        Logger.info("Signing in with email (emulator mode)")

        do {
            let result = try await Auth.auth().signIn(withEmail: email, password: password)
            Logger.info("Email sign-in successful for user: \(result.user.uid)")
            return result.user
        } catch {
            Logger.error("Email sign-in failed: \(error.localizedDescription)")
            throw mapAuthError(error)
        }
    }

    // MARK: - Error Mapping
    private func mapAuthError(_ error: Error) -> AppError {
        let nsError = error as NSError

        // Firebase Auth error codes
        switch nsError.code {
        case AuthErrorCode.invalidPhoneNumber.rawValue:
            return .invalidPhoneNumber
        case AuthErrorCode.invalidVerificationCode.rawValue:
            return .invalidOTP
        case AuthErrorCode.sessionExpired.rawValue:
            return .otpExpired
        case AuthErrorCode.networkError.rawValue:
            return .noInternetConnection
        case AuthErrorCode.tooManyRequests.rawValue:
            return .authenticationFailed("Too many attempts. Please try again later.")
        case AuthErrorCode.userDisabled.rawValue:
            return .authenticationFailed("This account has been disabled.")
        default:
            return .authenticationFailed(error.localizedDescription)
        }
    }
}

// MARK: - Mock Service for Previews
#if DEBUG
final class MockAuthService: AuthServiceProtocol {
    var currentUser: FirebaseAuth.User? { nil }
    var currentUserId: String? { "mock_user_123" }
    var isAuthenticated: Bool { true }

    func sendOTP(to phoneNumber: String) async throws -> String {
        try await Task.sleep(nanoseconds: 1_000_000_000) // 1 second delay
        return "mock_verification_id"
    }

    func verifyOTP(verificationId: String, code: String) async throws -> FirebaseAuth.User {
        try await Task.sleep(nanoseconds: 1_000_000_000)
        throw AppError.unknown("Mock auth - use real Firebase in actual app")
    }

    func signInWithEmail(email: String, password: String) async throws -> FirebaseAuth.User {
        try await Task.sleep(nanoseconds: 1_000_000_000)
        throw AppError.unknown("Mock auth - use real Firebase in actual app")
    }

    func signOut() throws {
        // Mock sign out
    }
}
#endif
