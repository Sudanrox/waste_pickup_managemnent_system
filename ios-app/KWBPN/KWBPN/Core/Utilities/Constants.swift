//
//  Constants.swift
//  KWBPN
//
//  App-wide constants
//

import Foundation

enum Constants {

    // MARK: - App Info
    enum App {
        static let name = "KWPM"
        static let fullName = "Kathmandu Waste Pickup Management"
        static let tagline = "Since 2026"
        static let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        static let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }

    // MARK: - Firebase Collections
    enum FirestoreCollection {
        static let organizations = "organizations"
        static let wards = "wards"
        static let customers = "customers"
        static let admins = "admins"
        static let notifications = "notifications"
        static let responses = "responses"
    }

    // MARK: - FCM Topics
    enum FCMTopic {
        static func ward(_ wardNumber: Int) -> String {
            return "ward_\(wardNumber)"
        }
    }

    // MARK: - UserDefaults Keys
    enum UserDefaultsKeys {
        static let language = "app_language"
        static let hasCompletedOnboarding = "has_completed_onboarding"
        static let lastWardNumber = "last_ward_number"
        static let fcmToken = "fcm_token"
    }

    // MARK: - Validation
    enum Validation {
        static let phoneNumberLength = 10
        static let phoneCountryCode = "+977"
        static let otpLength = 6
        static let minNameLength = 2
        static let maxNameLength = 50
        static let totalWards = 32
    }

    // MARK: - UI Constants
    enum UI {
        static let cornerRadius: CGFloat = 12
        static let buttonHeight: CGFloat = 56
        static let cardPadding: CGFloat = 16
        static let iconSize: CGFloat = 24
        static let animationDuration: Double = 0.3
    }

    // MARK: - Date Formats
    enum DateFormat {
        static let display = "MMM d, yyyy"
        static let displayWithTime = "MMM d, yyyy 'at' h:mm a"
        static let time = "h:mm a"
        static let dayMonth = "d MMM"
        static let iso8601 = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
    }

    // MARK: - Notification Types
    enum NotificationType: String {
        case pickupScheduled = "pickup_scheduled"
        case pickupRescheduled = "pickup_rescheduled"
        case pickupReminder = "pickup_reminder"
        case pickupCancelled = "pickup_cancelled"
    }

    // MARK: - Response Types
    enum ResponseType: String, Codable, CaseIterable {
        case yes = "yes"
        case no = "no"

        var displayText: String {
            switch self {
            case .yes: return String(localized: "YES")
            case .no: return String(localized: "NO")
            }
        }

        var emoji: String {
            switch self {
            case .yes: return "✓"
            case .no: return "✗"
            }
        }
    }

    // MARK: - Notification Status
    enum NotificationStatus: String, Codable {
        case scheduled = "scheduled"
        case sent = "sent"
        case completed = "completed"
        case cancelled = "cancelled"

        var displayText: String {
            switch self {
            case .scheduled: return String(localized: "Scheduled")
            case .sent: return String(localized: "Sent")
            case .completed: return String(localized: "Completed")
            case .cancelled: return String(localized: "Cancelled")
            }
        }
    }
}
