//
//  String+Extensions.swift
//  KWBPN
//
//  String manipulation and validation utilities
//

import Foundation

extension String {

    // MARK: - Phone Number Formatting
    var isValidNepaliPhoneNumber: Bool {
        // Nepali mobile numbers: 10 digits starting with 97 or 98
        let cleaned = self.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
        let pattern = "^(97|98)\\d{8}$"
        return cleaned.range(of: pattern, options: .regularExpression) != nil
    }

    var formattedPhoneNumber: String {
        let cleaned = self.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
        guard cleaned.count == 10 else { return self }
        // Format: 98X XXX XXXX
        let index1 = cleaned.index(cleaned.startIndex, offsetBy: 3)
        let index2 = cleaned.index(cleaned.startIndex, offsetBy: 6)
        return "\(cleaned[..<index1]) \(cleaned[index1..<index2]) \(cleaned[index2...])"
    }

    var phoneNumberWithCountryCode: String {
        let cleaned = self.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
        if cleaned.hasPrefix("977") {
            return "+\(cleaned)"
        }
        return "\(Constants.Validation.phoneCountryCode)\(cleaned)"
    }

    var phoneNumberWithoutCountryCode: String {
        var cleaned = self.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
        if cleaned.hasPrefix("977") {
            cleaned = String(cleaned.dropFirst(3))
        }
        return cleaned
    }

    // MARK: - OTP Validation
    var isValidOTP: Bool {
        let cleaned = self.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
        return cleaned.count == Constants.Validation.otpLength
    }

    // MARK: - Name Validation
    var isValidName: Bool {
        let trimmed = self.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.count >= Constants.Validation.minNameLength &&
               trimmed.count <= Constants.Validation.maxNameLength
    }

    // MARK: - Trimming
    var trimmed: String {
        self.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    // MARK: - Localization Helper
    var localized: String {
        NSLocalizedString(self, comment: "")
    }

    func localized(with arguments: CVarArg...) -> String {
        String(format: NSLocalizedString(self, comment: ""), arguments: arguments)
    }

    // MARK: - Empty Check
    var isNotEmpty: Bool {
        !self.isEmpty
    }

    var nilIfEmpty: String? {
        self.isEmpty ? nil : self
    }

    // MARK: - Masking
    var maskedPhoneNumber: String {
        guard self.count >= 4 else { return self }
        let visibleDigits = 4
        let masked = String(repeating: "•", count: self.count - visibleDigits)
        return masked + self.suffix(visibleDigits)
    }
}

// MARK: - Optional String Extension
extension Optional where Wrapped == String {

    var orEmpty: String {
        self ?? ""
    }

    var isNilOrEmpty: Bool {
        self?.isEmpty ?? true
    }

    var isNotNilOrEmpty: Bool {
        !isNilOrEmpty
    }
}
