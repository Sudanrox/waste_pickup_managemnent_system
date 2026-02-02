//
//  PhoneTextField.swift
//  KWBPN
//
//  Phone number input field with country code
//

import SwiftUI

struct PhoneTextField: View {

    // MARK: - Properties
    @Binding var phoneNumber: String
    var placeholder: String = "98XXXXXXXX"
    var isDisabled: Bool = false
    var errorMessage: String?
    @FocusState private var isFocused: Bool

    // MARK: - Body
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Label
            Text("Phone Number")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)

            // Input Field
            HStack(spacing: 12) {
                // Country Code
                HStack(spacing: 6) {
                    Text("🇳🇵")
                        .font(.title2)
                    Text("+977")
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 14)
                .background(Color.tertiaryBackground)
                .cornerRadius(Constants.UI.cornerRadius)

                // Phone Number Input
                TextField(placeholder, text: $phoneNumber)
                    .font(.body)
                    .fontWeight(.medium)
                    .keyboardType(.phonePad)
                    .textContentType(.telephoneNumber)
                    .focused($isFocused)
                    .disabled(isDisabled)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(Color.secondaryBackground)
                    .cornerRadius(Constants.UI.cornerRadius)
                    .overlay(
                        RoundedRectangle(cornerRadius: Constants.UI.cornerRadius)
                            .stroke(borderColor, lineWidth: isFocused ? 2 : 0)
                    )
                    .onChange(of: phoneNumber) { _, newValue in
                        // Limit to 10 digits
                        let filtered = newValue.filter { $0.isNumber }
                        if filtered.count > Constants.Validation.phoneNumberLength {
                            phoneNumber = String(filtered.prefix(Constants.Validation.phoneNumberLength))
                        } else {
                            phoneNumber = filtered
                        }
                    }
            }

            // Error Message
            if let error = errorMessage {
                HStack(spacing: 4) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.caption)
                    Text(error)
                        .font(.caption)
                }
                .foregroundColor(.error)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .animation(.easeInOut(duration: 0.2), value: errorMessage)
    }

    // MARK: - Computed Properties
    private var borderColor: Color {
        if errorMessage != nil {
            return .error
        }
        return .accentColor
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 24) {
        PhoneTextField(
            phoneNumber: .constant(""),
            placeholder: "98XXXXXXXX"
        )

        PhoneTextField(
            phoneNumber: .constant("9841234567"),
            placeholder: "98XXXXXXXX"
        )

        PhoneTextField(
            phoneNumber: .constant("984"),
            placeholder: "98XXXXXXXX",
            errorMessage: "Please enter a valid phone number"
        )
    }
    .padding()
}
