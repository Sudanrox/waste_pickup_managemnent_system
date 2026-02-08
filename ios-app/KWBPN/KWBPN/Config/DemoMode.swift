//
//  DemoMode.swift
//  KWBPN
//
//  Demo mode configuration for testing without Firebase
//

import Foundation

/// Global demo mode flag - set to true to use mock data
/// Change this to false for production builds
struct DemoConfig {
    /// Enable demo mode for testing without Firebase
    /// Set to false to use Firebase emulators
    static let isEnabled = false

    /// Demo user profile
    static let demoCustomer = Customer(
        id: "demo_user_001",
        phoneNumber: "+9779812345678",
        name: "Ram Sharma",
        wardId: "ward_13",
        wardNumber: 13,
        fcmToken: nil,
        language: "en",
        createdAt: Date().addingTimeInterval(-86400 * 30),
        updatedAt: Date(),
        isActive: true
    )

    /// Generate demo notifications for testing
    static func generateDemoNotifications() -> [PickupNotification] {
        let calendar = Calendar.current
        var notifications: [PickupNotification] = []

        // Today's notification (most important - SENT status so user can respond)
        let todayNotification = PickupNotification(
            id: "notif_today_001",
            wardId: "ward_13",
            wardNumber: 13,
            scheduledDate: Date(),
            scheduledTime: "7:00 AM",
            messageText: "Waste pickup scheduled for Ward 13 (Baneshwor) today. Please keep your waste ready at the collection point by 7:00 AM.",
            messageTextNe: "वडा १३ (बानेश्वर) को लागि आज फोहोर संकलन तालिका। कृपया बिहान ७:०० बजेसम्म संकलन स्थानमा आफ्नो फोहोर तयार राख्नुहोस्।",
            status: .sent,
            createdBy: "admin_001",
            createdAt: Date().addingTimeInterval(-86400),
            sentAt: Date().addingTimeInterval(-3600),
            responseStats: .init(yesCount: 189, noCount: 23, totalCustomers: 245)
        )
        notifications.append(todayNotification)

        // Tomorrow's notification (scheduled - not sent yet)
        if let tomorrow = calendar.date(byAdding: .day, value: 1, to: Date()) {
            let tomorrowNotification = PickupNotification(
                id: "notif_tomorrow_001",
                wardId: "ward_13",
                wardNumber: 13,
                scheduledDate: tomorrow,
                scheduledTime: "8:00 AM",
                messageText: "Waste pickup scheduled for Ward 13 (Baneshwor) tomorrow. Please keep your waste ready at the collection point by 8:00 AM.",
                messageTextNe: "वडा १३ (बानेश्वर) को लागि भोलि फोहोर संकलन तालिका। कृपया बिहान ८:०० बजेसम्म संकलन स्थानमा आफ्नो फोहोर तयार राख्नुहोस्।",
                status: .scheduled,
                createdBy: "admin_001",
                createdAt: Date(),
                responseStats: .init(yesCount: 0, noCount: 0, totalCustomers: 245)
            )
            notifications.append(tomorrowNotification)
        }

        // Past notifications (completed)
        for i in 1...5 {
            if let pastDate = calendar.date(byAdding: .day, value: -i * 3, to: Date()) {
                let yesCount = Int.random(in: 150...220)
                let noCount = Int.random(in: 10...40)

                let notification = PickupNotification(
                    id: "notif_past_\(i)",
                    wardId: "ward_13",
                    wardNumber: 13,
                    scheduledDate: pastDate,
                    scheduledTime: "\(6 + i % 3):00 AM",
                    messageText: "Waste pickup was scheduled for Ward 13 (Baneshwor). Thank you for your participation.",
                    messageTextNe: "वडा १३ (बानेश्वर) को लागि फोहोर संकलन तालिका थियो। तपाईंको सहभागिताको लागि धन्यवाद।",
                    status: .completed,
                    createdBy: "admin_001",
                    createdAt: pastDate.addingTimeInterval(-86400),
                    sentAt: pastDate.addingTimeInterval(-86400),
                    responseStats: .init(yesCount: yesCount, noCount: noCount, totalCustomers: 245)
                )
                notifications.append(notification)
            }
        }

        // Future notifications (scheduled)
        for i in 2...4 {
            if let futureDate = calendar.date(byAdding: .day, value: i * 2, to: Date()) {
                let notification = PickupNotification(
                    id: "notif_future_\(i)",
                    wardId: "ward_13",
                    wardNumber: 13,
                    scheduledDate: futureDate,
                    scheduledTime: "\(6 + i % 4):00 AM",
                    messageText: "Upcoming waste pickup for Ward 13 (Baneshwor). Mark your calendar!",
                    messageTextNe: "वडा १३ (बानेश्वर) को लागि आगामी फोहोर संकलन। आफ्नो क्यालेन्डरमा चिन्ह लगाउनुहोस्!",
                    status: .scheduled,
                    createdBy: "admin_001",
                    createdAt: Date(),
                    responseStats: .init(yesCount: 0, noCount: 0, totalCustomers: 245)
                )
                notifications.append(notification)
            }
        }

        return notifications.sorted { $0.scheduledDate > $1.scheduledDate }
    }

    /// Demo responses storage (in-memory)
    static var demoResponses: [String: PickupResponse] = [:]
}
