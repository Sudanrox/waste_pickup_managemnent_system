//
//  ResponseButton.swift
//  KWBPN
//
//  YES/NO response buttons for pickup notifications
//

import SwiftUI

struct ResponseButton: View {

    // MARK: - Properties
    let responseType: Constants.ResponseType
    var isSelected: Bool = false
    var isLoading: Bool = false
    var isDisabled: Bool = false
    let action: () -> Void

    // MARK: - Computed Properties
    private var backgroundColor: Color {
        if isSelected {
            return responseType == .yes ? .success : .error
        }
        return .secondaryBackground
    }

    private var foregroundColor: Color {
        if isSelected {
            return .white
        }
        return responseType == .yes ? .success : .error
    }

    private var borderColor: Color {
        responseType == .yes ? .success : .error
    }

    private var iconName: String {
        responseType == .yes ? "checkmark.circle.fill" : "xmark.circle.fill"
    }

    // MARK: - Body
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                if isLoading && isSelected {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: foregroundColor))
                        .frame(width: 32, height: 32)
                } else {
                    Image(systemName: iconName)
                        .font(.system(size: 32, weight: .semibold))
                }

                Text(responseType.displayText)
                    .font(.title2)
                    .fontWeight(.bold)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 120)
            .background(backgroundColor)
            .foregroundColor(foregroundColor)
            .cornerRadius(Constants.UI.cornerRadius)
            .overlay(
                RoundedRectangle(cornerRadius: Constants.UI.cornerRadius)
                    .stroke(borderColor, lineWidth: isSelected ? 0 : 2)
            )
            .opacity(isDisabled && !isSelected ? 0.5 : 1.0)
        }
        .disabled(isDisabled || isLoading)
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Response Button Pair
struct ResponseButtonPair: View {

    // MARK: - Properties
    let currentResponse: Constants.ResponseType?
    var isLoading: Bool = false
    var isDisabled: Bool = false
    let onResponse: (Constants.ResponseType) -> Void

    // MARK: - Body
    var body: some View {
        HStack(spacing: 16) {
            ResponseButton(
                responseType: .yes,
                isSelected: currentResponse == .yes,
                isLoading: isLoading && currentResponse == .yes,
                isDisabled: isDisabled || (isLoading && currentResponse != .yes)
            ) {
                onResponse(.yes)
            }

            ResponseButton(
                responseType: .no,
                isSelected: currentResponse == .no,
                isLoading: isLoading && currentResponse == .no,
                isDisabled: isDisabled || (isLoading && currentResponse != .no)
            ) {
                onResponse(.no)
            }
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 24) {
        Text("Not Responded")
            .font(.headline)
        ResponseButtonPair(currentResponse: nil) { response in
            print("Selected: \(response)")
        }

        Divider()

        Text("Responded YES")
            .font(.headline)
        ResponseButtonPair(currentResponse: .yes) { response in
            print("Selected: \(response)")
        }

        Divider()

        Text("Responded NO")
            .font(.headline)
        ResponseButtonPair(currentResponse: .no) { response in
            print("Selected: \(response)")
        }

        Divider()

        Text("Loading")
            .font(.headline)
        ResponseButtonPair(currentResponse: .yes, isLoading: true) { response in
            print("Selected: \(response)")
        }
    }
    .padding()
}
