//
//  PickupResponse.swift
//  KWBPN
//
//  Customer response to pickup notification
//

import Foundation
import FirebaseFirestore

struct PickupResponse: Identifiable, Codable, Equatable {

    // MARK: - Properties
    let id: String
    let notificationId: String
    let customerId: String
    var customerName: String
    let wardId: String
    let wardNumber: Int
    var response: Constants.ResponseType
    var respondedAt: Date
    var updatedAt: Date

    // MARK: - Coding Keys
    enum CodingKeys: String, CodingKey {
        case id
        case notificationId
        case customerId
        case customerName
        case wardId
        case wardNumber
        case response
        case respondedAt
        case updatedAt
    }

    // MARK: - Initialization
    init(
        id: String,
        notificationId: String,
        customerId: String,
        customerName: String,
        wardId: String,
        wardNumber: Int,
        response: Constants.ResponseType,
        respondedAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.notificationId = notificationId
        self.customerId = customerId
        self.customerName = customerName
        self.wardId = wardId
        self.wardNumber = wardNumber
        self.response = response
        self.respondedAt = respondedAt
        self.updatedAt = updatedAt
    }

    // MARK: - Firestore Initialization
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }

        self.id = document.documentID
        self.notificationId = data["notificationId"] as? String ?? ""
        self.customerId = data["customerId"] as? String ?? ""
        self.customerName = data["customerName"] as? String ?? ""
        self.wardId = data["wardId"] as? String ?? ""
        self.wardNumber = data["wardNumber"] as? Int ?? 0

        if let responseString = data["response"] as? String,
           let responseType = Constants.ResponseType(rawValue: responseString) {
            self.response = responseType
        } else {
            self.response = .no
        }

        self.respondedAt = (data["respondedAt"] as? Timestamp)?.dateValue() ?? Date()
        self.updatedAt = (data["updatedAt"] as? Timestamp)?.dateValue() ?? Date()
    }

    // MARK: - To Dictionary
    func toDictionary() -> [String: Any] {
        [
            "notificationId": notificationId,
            "customerId": customerId,
            "customerName": customerName,
            "wardId": wardId,
            "wardNumber": wardNumber,
            "response": response.rawValue,
            "respondedAt": Timestamp(date: respondedAt),
            "updatedAt": Timestamp(date: updatedAt)
        ]
    }

    // MARK: - Factory Method
    static func create(
        for notificationId: String,
        customer: Customer,
        response: Constants.ResponseType
    ) -> PickupResponse {
        let id = "\(notificationId)_\(customer.id)"
        return PickupResponse(
            id: id,
            notificationId: notificationId,
            customerId: customer.id,
            customerName: customer.name,
            wardId: customer.wardId,
            wardNumber: customer.wardNumber,
            response: response
        )
    }

    // MARK: - Computed Properties
    var isYes: Bool {
        response == .yes
    }

    var isNo: Bool {
        response == .no
    }

    var responseDisplayText: String {
        response.displayText
    }

    var respondedAtFormatted: String {
        respondedAt.smartDisplayString
    }

    var statusText: String {
        let responseText = response == .yes ? "YES" : "NO"
        return "You responded \(responseText) at \(respondedAt.timeString)"
    }
}

// MARK: - Mock Data
extension PickupResponse {
    static let mock = PickupResponse(
        id: "notif_123_customer_456",
        notificationId: "notif_123",
        customerId: "customer_456",
        customerName: "Ram Sharma",
        wardId: "ward_5",
        wardNumber: 5,
        response: .yes,
        respondedAt: Date().adding(hours: -1)
    )

    static let mockList = [
        mock,
        PickupResponse(
            id: "notif_123_customer_789",
            notificationId: "notif_123",
            customerId: "customer_789",
            customerName: "Sita Devi",
            wardId: "ward_5",
            wardNumber: 5,
            response: .no,
            respondedAt: Date().adding(hours: -2)
        ),
        PickupResponse(
            id: "notif_123_customer_101",
            notificationId: "notif_123",
            customerId: "customer_101",
            customerName: "Hari Prasad",
            wardId: "ward_5",
            wardNumber: 5,
            response: .yes,
            respondedAt: Date().adding(hours: -3)
        )
    ]
}
