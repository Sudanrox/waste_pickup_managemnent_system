//
//  Ward.swift
//  KWBPN
//
//  Ward data model
//

import Foundation
import FirebaseFirestore

struct Ward: Identifiable, Codable, Equatable, Hashable {

    // MARK: - Properties
    let id: String
    let wardNumber: Int
    var name: String
    var nameNe: String
    var customerCount: Int
    var isActive: Bool

    // MARK: - Coding Keys
    enum CodingKeys: String, CodingKey {
        case id
        case wardNumber
        case name
        case nameNe
        case customerCount
        case isActive
    }

    // MARK: - Initialization
    init(
        id: String,
        wardNumber: Int,
        name: String,
        nameNe: String,
        customerCount: Int = 0,
        isActive: Bool = true
    ) {
        self.id = id
        self.wardNumber = wardNumber
        self.name = name
        self.nameNe = nameNe
        self.customerCount = customerCount
        self.isActive = isActive
    }

    // MARK: - Firestore Initialization
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }

        self.id = document.documentID
        self.wardNumber = data["wardNumber"] as? Int ?? 0
        self.name = data["name"] as? String ?? ""
        self.nameNe = data["nameNe"] as? String ?? ""
        self.customerCount = data["customerCount"] as? Int ?? 0
        self.isActive = data["isActive"] as? Bool ?? true
    }

    // MARK: - To Dictionary
    func toDictionary() -> [String: Any] {
        [
            "wardNumber": wardNumber,
            "name": name,
            "nameNe": nameNe,
            "customerCount": customerCount,
            "isActive": isActive
        ]
    }

    // MARK: - Computed Properties
    var displayName: String {
        "Ward \(wardNumber)"
    }

    var localizedName: String {
        // Returns Nepali name if current locale is Nepali
        let currentLanguage = Locale.current.language.languageCode?.identifier ?? "en"
        return currentLanguage == "ne" ? nameNe : name
    }

    var fcmTopic: String {
        Constants.FCMTopic.ward(wardNumber)
    }
}

// MARK: - Mock Data
extension Ward {
    static let mock = Ward(
        id: "ward_5",
        wardNumber: 5,
        name: "Ward 5 - Baneshwor",
        nameNe: "वडा ५ - बानेश्वर",
        customerCount: 245
    )

    static let allWards: [Ward] = (1...32).map { number in
        Ward(
            id: "ward_\(number)",
            wardNumber: number,
            name: "Ward \(number)",
            nameNe: "वडा \(number.nepaliNumeral)",
            customerCount: Int.random(in: 100...500)
        )
    }
}

// MARK: - Nepali Numeral Extension
extension Int {
    var nepaliNumeral: String {
        let nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
        return String(self).map { char in
            if let digit = Int(String(char)), digit < 10 {
                return nepaliDigits[digit]
            }
            return String(char)
        }.joined()
    }
}
