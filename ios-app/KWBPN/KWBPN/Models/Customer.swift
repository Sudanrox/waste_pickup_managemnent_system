//
//  Customer.swift
//  KWBPN
//
//  Customer data model
//

import Foundation
import FirebaseFirestore

struct Customer: Identifiable, Codable, Equatable {

    // MARK: - Properties
    let id: String
    var phoneNumber: String
    var name: String
    var wardId: String
    var wardNumber: Int
    var fcmToken: String?
    var language: String
    var createdAt: Date
    var updatedAt: Date
    var isActive: Bool

    // MARK: - Coding Keys
    enum CodingKeys: String, CodingKey {
        case id
        case phoneNumber
        case name
        case wardId
        case wardNumber
        case fcmToken
        case language
        case createdAt
        case updatedAt
        case isActive
    }

    // MARK: - Initialization
    init(
        id: String,
        phoneNumber: String,
        name: String,
        wardId: String,
        wardNumber: Int,
        fcmToken: String? = nil,
        language: String = "ne",
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        isActive: Bool = true
    ) {
        self.id = id
        self.phoneNumber = phoneNumber
        self.name = name
        self.wardId = wardId
        self.wardNumber = wardNumber
        self.fcmToken = fcmToken
        self.language = language
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.isActive = isActive
    }

    // MARK: - Firestore Initialization
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }

        self.id = document.documentID
        self.phoneNumber = data["phoneNumber"] as? String ?? ""
        self.name = data["name"] as? String ?? ""
        self.wardId = data["wardId"] as? String ?? ""
        self.wardNumber = data["wardNumber"] as? Int ?? 0
        self.fcmToken = data["fcmToken"] as? String
        self.language = data["language"] as? String ?? "ne"
        self.createdAt = (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        self.updatedAt = (data["updatedAt"] as? Timestamp)?.dateValue() ?? Date()
        self.isActive = data["isActive"] as? Bool ?? true
    }

    // MARK: - To Dictionary
    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "phoneNumber": phoneNumber,
            "name": name,
            "wardId": wardId,
            "wardNumber": wardNumber,
            "language": language,
            "createdAt": Timestamp(date: createdAt),
            "updatedAt": Timestamp(date: updatedAt),
            "isActive": isActive
        ]

        if let fcmToken = fcmToken {
            dict["fcmToken"] = fcmToken
        }

        return dict
    }

    // MARK: - Computed Properties
    var formattedPhone: String {
        phoneNumber.formattedPhoneNumber
    }

    var wardDisplayName: String {
        "Ward \(wardNumber)"
    }

    var appLanguage: AppLanguage {
        AppLanguage(rawValue: language) ?? .nepali
    }
}

// MARK: - Mock Data
extension Customer {
    static let mock = Customer(
        id: "customer_123",
        phoneNumber: "+9779841234567",
        name: "Ram Sharma",
        wardId: "ward_5",
        wardNumber: 5,
        fcmToken: "mock_token",
        language: "ne"
    )

    static let mockList = [
        mock,
        Customer(
            id: "customer_456",
            phoneNumber: "+9779851234567",
            name: "Sita Devi",
            wardId: "ward_5",
            wardNumber: 5,
            language: "en"
        ),
        Customer(
            id: "customer_789",
            phoneNumber: "+9779861234567",
            name: "Hari Prasad",
            wardId: "ward_5",
            wardNumber: 5,
            language: "ne"
        )
    ]
}
