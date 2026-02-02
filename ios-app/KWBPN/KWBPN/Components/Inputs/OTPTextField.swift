//
//  OTPTextField.swift
//  KWBPN
//
//  OTP input field with individual digit boxes
//

import SwiftUI

struct OTPTextField: View {

    // MARK: - Properties
    @Binding var otp: String
    var numberOfDigits: Int = Constants.Validation.otpLength
    var isDisabled: Bool = false
    var errorMessage: String?
    @FocusState private var isFocused: Bool

    // MARK: - Body
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Label
            Text("Enter OTP")
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)

            // OTP Boxes
            HStack(spacing: 8) {
                ForEach(0..<numberOfDigits, id: \.self) { index in
                    OTPDigitBox(
                        digit: getDigit(at: index),
                        isActive: otp.count == index && isFocused,
                        hasError: errorMessage != nil
                    )
                }
            }
            .background(
                // Hidden TextField for input
                TextField("", text: $otp)
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode)
                    .focused($isFocused)
                    .disabled(isDisabled)
                    .opacity(0)
                    .onChange(of: otp) { _, newValue in
                        // Filter to digits only and limit length
                        let filtered = newValue.filter { $0.isNumber }
                        if filtered.count > numberOfDigits {
                            otp = String(filtered.prefix(numberOfDigits))
                        } else {
                            otp = filtered
                        }
                    }
            )
            .onTapGesture {
                isFocused = true
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

    // MARK: - Helper Methods
    private func getDigit(at index: Int) -> String {
        guard index < otp.count else { return "" }
        let startIndex = otp.index(otp.startIndex, offsetBy: index)
        return String(otp[startIndex])
    }
}

// MARK: - OTP Digit Box
struct OTPDigitBox: View {
    let digit: String
    var isActive: Bool = false
    var hasError: Bool = false

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.secondaryBackground)

            RoundedRectangle(cornerRadius: 12)
                .stroke(borderColor, lineWidth: isActive ? 2 : 0)

            if digit.isEmpty && isActive {
                // Cursor
                Rectangle()
                    .fill(Color.accentColor)
                    .frame(width: 2, height: 24)
                    .opacity(1)
                    .animation(.easeInOut(duration: 0.5).repeatForever(), value: isActive)
            } else {
                Text(digit)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
            }
        }
        .frame(width: 48, height: 56)
    }

    private var borderColor: Color {
        if hasError { return .error }
        if isActive { return .accentColor }
        return .clear
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 32) {
        OTPTextField(otp: .constant(""))

        OTPTextField(otp: .constant("123"))

        OTPTextField(otp: .constant("123456"))

        OTPTextField(
            otp: .constant("123"),
            errorMessage: "Invalid OTP. Please try again."
        )
    }
    .padding()
}
