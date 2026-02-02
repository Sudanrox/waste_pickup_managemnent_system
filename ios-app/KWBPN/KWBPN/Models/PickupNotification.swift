//
//  PickupNotification.swift
//  KWBPN
//
//  Pickup notification data model
//

import Foundation
import FirebaseFirestore

struct PickupNotification: Identifiable, Codable, Equatable {

    // MARK: - Properties
    let id: String
    let wardId: String
    let wardNumber: Int
    let scheduledDate: Date
    let scheduledTime: String
    let messageText: String
    let messageTextNe: String
    var status: Constants.NotificationStatus
    let createdBy: String
    let createdAt: Date
    var sentAt: Date?
    var parentNotificationId: String?
    var responseStats: ResponseStats
    var isRescheduled: Bool

    // MARK: - Response Stats
    struct ResponseStats: Codable, Equatable {
        var yesCount: Int
        var noCount: Int
        var totalCustomers: Int

        var noResponseCount: Int {
            max(0, totalCustomers - yesCount - noCount)
        }

        var yesPercentage: Double {
            guard totalCustomers > 0 else { return 0 }
            return Double(yesCount) / Double(totalCustomers) * 100
        }

        var noPercentage: Double {
            guard totalCustomers > 0 else { return 0 }
            return Double(noCount) / Double(totalCustomers) * 100
        }

        var responseRate: Double {
            guard totalCustomers > 0 else { return 0 }
            return Double(yesCount + noCount) / Double(totalCustomers) * 100
        }

        static let empty = ResponseStats(yesCount: 0, noCount: 0, totalCustomers: 0)
    }

    // MARK: - Coding Keys
    enum CodingKeys: String, CodingKey {
        case id
        case wardId
        case wardNumber
        case scheduledDate
        case scheduledTime
        case messageText
        case messageTextNe
        case status
        case createdBy
        case createdAt
        case sentAt
        case parentNotificationId
        case responseStats
        case isRescheduled
    }

    // MARK: - Initialization
    init(
        id: String,
        wardId: String,
        wardNumber: Int,
        scheduledDate: Date,
        scheduledTime: String,
        messageText: String,
        messageTextNe: String,
        status: Constants.NotificationStatus = .scheduled,
        createdBy: String,
        createdAt: Date = Date(),
        sentAt: Date? = nil,
        parentNotificationId: String? = nil,
        responseStats: ResponseStats = .empty,
        isRescheduled: Bool = false
    ) {
        self.id = id
        self.wardId = wardId
        self.wardNumber = wardNumber
        self.scheduledDate = scheduledDate
        self.scheduledTime = scheduledTime
        self.messageText = messageText
        self.messageTextNe = messageTextNe
        self.status = status
        self.createdBy = createdBy
        self.createdAt = createdAt
        self.sentAt = sentAt
        self.parentNotificationId = parentNotificationId
        self.responseStats = responseStats
        self.isRescheduled = isRescheduled
    }

    // MARK: - Firestore Initialization
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }

        self.id = document.documentID
        self.wardId = data["wardId"] as? String ?? ""
        self.wardNumber = data["wardNumber"] as? Int ?? 0
        self.scheduledDate = (data["scheduledDate"] as? Timestamp)?.dateValue() ?? Date()
        self.scheduledTime = data["scheduledTime"] as? String ?? ""
        self.messageText = data["messageText"] as? String ?? ""
        self.messageTextNe = data["messageTextNe"] as? String ?? ""

        if let statusString = data["status"] as? String,
           let status = Constants.NotificationStatus(rawValue: statusString) {
            self.status = status
        } else {
            self.status = .scheduled
        }

        self.createdBy = data["createdBy"] as? String ?? ""
        self.createdAt = (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        self.sentAt = (data["sentAt"] as? Timestamp)?.dateValue()
        self.parentNotificationId = data["parentNotificationId"] as? String
        self.isRescheduled = data["isRescheduled"] as? Bool ?? false

        // Parse response stats
        if let statsData = data["responseStats"] as? [String: Any] {
            self.responseStats = ResponseStats(
                yesCount: statsData["yesCount"] as? Int ?? 0,
                noCount: statsData["noCount"] as? Int ?? 0,
                totalCustomers: statsData["totalCustomers"] as? Int ?? 0
            )
        } else {
            self.responseStats = .empty
        }
    }

    // MARK: - To Dictionary
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "wardId": wardId,
            "wardNumber": wardNumber,
            "scheduledDate": Timestamp(date: scheduledDate),
            "scheduledTime": scheduledTime,
            "messageText": messageText,
            "messageTextNe": messageTextNe,
            "status": status.rawValue,
            "createdBy": createdBy,
            "createdAt": Timestamp(date: createdAt),
            "isRescheduled": isRescheduled,
            "responseStats": [
                "yesCount": responseStats.yesCount,
                "noCount": responseStats.noCount,
                "totalCustomers": responseStats.totalCustomers
            ]
        ]

        if let sentAt = sentAt {
            dict["sentAt"] = Timestamp(date: sentAt)
        }

        if let parentId = parentNotificationId {
            dict["parentNotificationId"] = parentId
        }

        return dict
    }

    // MARK: - Computed Properties
    var localizedMessage: String {
        let currentLanguage = Locale.current.language.languageCode?.identifier ?? "en"
        return currentLanguage == "ne" ? messageTextNe : messageText
    }

    var wardDisplayName: String {
        "Ward \(wardNumber)"
    }

    var formattedDateTime: String {
        "\(scheduledDate.displayString) at \(scheduledTime)"
    }

    var isUpcoming: Bool {
        scheduledDate >= Date().startOfDay && status != .cancelled
    }

    var isPast: Bool {
        scheduledDate < Date().startOfDay
    }

    var canRespond: Bool {
        status == .sent && !isPast
    }
}

// MARK: - Mock Data
extension PickupNotification {
    static let mock = PickupNotification(
        id: "notif_123",
        wardId: "ward_5",
        wardNumber: 5,
        scheduledDate: Date().adding(days: 1),
        scheduledTime: "9:00 AM",
        messageText: "Waste pickup scheduled for Ward 5. Please keep your waste ready at the collection point.",
        messageTextNe: "वडा ५ को लागि फोहोर संकलन तालिका बनाइएको छ। कृपया आफ्नो फोहोर संकलन स्थानमा तयार राख्नुहोस्।",
        status: .sent,
        createdBy: "admin_123",
        createdAt: Date().adding(hours: -2),
        sentAt: Date().adding(hours: -1),
        responseStats: .init(yesCount: 180, noCount: 45, totalCustomers: 245)
    )

    static let mockList = [
        mock,
        PickupNotification(
            id: "notif_456",
            wardId: "ward_5",
            wardNumber: 5,
            scheduledDate: Date().adding(days: -1),
            scheduledTime: "10:00 AM",
            messageText: "Waste pickup completed for Ward 5. Thank you for your cooperation.",
            messageTextNe: "वडा ५ को फोहोर संकलन सम्पन्न भयो। तपाईंको सहयोगको लागि धन्यवाद।",
            status: .completed,
            createdBy: "admin_123",
            createdAt: Date().adding(days: -2),
            sentAt: Date().adding(days: -2),
            responseStats: .init(yesCount: 200, noCount: 30, totalCustomers: 245)
        ),
        PickupNotification(
            id: "notif_789",
            wardId: "ward_5",
            wardNumber: 5,
            scheduledDate: Date().adding(days: 3),
            scheduledTime: "8:00 AM",
            messageText: "Special waste collection for Ward 5. Electronic waste will be collected.",
            messageTextNe: "वडा ५ को लागि विशेष फोहोर संकलन। इलेक्ट्रोनिक फोहोर संकलन गरिनेछ।",
            status: .scheduled,
            createdBy: "admin_123",
            responseStats: .init(yesCount: 0, noCount: 0, totalCustomers: 245)
        )
    ]
}
