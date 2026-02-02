//
//  AppError.swift
//  KWBPN
//
//  Unified error handling
//

import Foundation

// MARK: - App Error
enum AppError: Error, LocalizedError, Equatable {

    // MARK: - Authentication Errors
    case invalidPhoneNumber
    case invalidOTP
    case otpExpired
    case authenticationFailed(String)
    case userNotFound
    case sessionExpired

    // MARK: - Network Errors
    case noInternetConnection
    case serverError(String)
    case timeout
    case requestFailed

    // MARK: - Data Errors
    case dataNotFound
    case invalidData
    case parseFailed
    case documentNotFound

    // MARK: - Validation Errors
    case invalidName
    case invalidWard
    case validationFailed(String)

    // MARK: - Permission Errors
    case notificationPermissionDenied
    case unauthorized

    // MARK: - Generic Errors
    case unknown(String)

    // MARK: - LocalizedError
    var errorDescription: String? {
        switch self {
        case .invalidPhoneNumber:
            return String(localized: "Please enter a valid Nepali phone number")
        case .invalidOTP:
            return String(localized: "Invalid OTP. Please check and try again")
        case .otpExpired:
            return String(localized: "OTP has expired. Please request a new one")
        case .authenticationFailed(let message):
            return String(localized: "Authentication failed: \(message)")
        case .userNotFound:
            return String(localized: "User not found. Please register first")
        case .sessionExpired:
            return String(localized: "Your session has expired. Please login again")
        case .noInternetConnection:
            return String(localized: "No internet connection. Please check your network")
        case .serverError(let message):
            return String(localized: "Server error: \(message)")
        case .timeout:
            return String(localized: "Request timed out. Please try again")
        case .requestFailed:
            return String(localized: "Request failed. Please try again")
        case .dataNotFound:
            return String(localized: "Data not found")
        case .invalidData:
            return String(localized: "Invalid data received")
        case .parseFailed:
            return String(localized: "Failed to process data")
        case .documentNotFound:
            return String(localized: "Document not found")
        case .invalidName:
            return String(localized: "Please enter a valid name (2-50 characters)")
        case .invalidWard:
            return String(localized: "Please select a valid ward number (1-32)")
        case .validationFailed(let message):
            return String(localized: "Validation failed: \(message)")
        case .notificationPermissionDenied:
            return String(localized: "Notification permission denied. Please enable in Settings")
        case .unauthorized:
            return String(localized: "You are not authorized to perform this action")
        case .unknown(let message):
            return message.isEmpty ? String(localized: "An unknown error occurred") : message
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .invalidPhoneNumber:
            return "Enter a 10-digit number starting with 97 or 98"
        case .invalidOTP:
            return "Check the OTP sent to your phone"
        case .otpExpired:
            return "Tap 'Resend OTP' to get a new code"
        case .noInternetConnection:
            return "Check your WiFi or mobile data connection"
        case .sessionExpired:
            return "You will be redirected to login"
        case .notificationPermissionDenied:
            return "Go to Settings > KWBPN > Notifications and enable notifications"
        default:
            return nil
        }
    }

    // MARK: - Initialization from Error
    init(_ error: Error) {
        if let appError = error as? AppError {
            self = appError
        } else {
            let nsError = error as NSError

            // Check for network errors
            if nsError.domain == NSURLErrorDomain {
                switch nsError.code {
                case NSURLErrorNotConnectedToInternet:
                    self = .noInternetConnection
                case NSURLErrorTimedOut:
                    self = .timeout
                default:
                    self = .requestFailed
                }
            } else {
                self = .unknown(error.localizedDescription)
            }
        }
    }

    // MARK: - Equatable
    static func == (lhs: AppError, rhs: AppError) -> Bool {
        lhs.errorDescription == rhs.errorDescription
    }
}

// MARK: - Alert Presentable
struct AlertItem: Identifiable {
    let id = UUID()
    let title: String
    let message: String
    let primaryButton: AlertButton
    var secondaryButton: AlertButton?

    struct AlertButton {
        let title: String
        let action: () -> Void

        static let ok = AlertButton(title: "OK") {}
        static let cancel = AlertButton(title: "Cancel") {}

        static func retry(action: @escaping () -> Void) -> AlertButton {
            AlertButton(title: "Retry", action: action)
        }
    }

    init(error: AppError, retryAction: (() -> Void)? = nil) {
        self.title = "Error"
        self.message = error.errorDescription ?? "An error occurred"
        self.primaryButton = .ok

        if let retry = retryAction {
            self.secondaryButton = .retry(action: retry)
        }
    }

    init(title: String, message: String) {
        self.title = title
        self.message = message
        self.primaryButton = .ok
    }
}
