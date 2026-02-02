//
//  PrimaryButton.swift
//  KWBPN
//
//  Primary action button component
//

import SwiftUI

struct PrimaryButton: View {

    // MARK: - Properties
    let title: String
    var isLoading: Bool = false
    var isDisabled: Bool = false
    var style: Style = .primary
    let action: () -> Void

    // MARK: - Style
    enum Style {
        case primary
        case secondary
        case destructive

        var backgroundColor: Color {
            switch self {
            case .primary: return .accentColor
            case .secondary: return .secondaryBackground
            case .destructive: return .error
            }
        }

        var foregroundColor: Color {
            switch self {
            case .primary: return .white
            case .secondary: return .primary
            case .destructive: return .white
            }
        }
    }

    // MARK: - Body
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: style.foregroundColor))
                        .scaleEffect(0.9)
                }

                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .frame(height: Constants.UI.buttonHeight)
            .background(style.backgroundColor)
            .foregroundColor(style.foregroundColor)
            .cornerRadius(Constants.UI.cornerRadius)
            .opacity(isDisabled || isLoading ? 0.6 : 1.0)
        }
        .disabled(isDisabled || isLoading)
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Scale Button Style
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 16) {
        PrimaryButton(title: "Continue") {
            print("Tapped")
        }

        PrimaryButton(title: "Loading...", isLoading: true) {
            print("Tapped")
        }

        PrimaryButton(title: "Disabled", isDisabled: true) {
            print("Tapped")
        }

        PrimaryButton(title: "Secondary", style: .secondary) {
            print("Tapped")
        }

        PrimaryButton(title: "Delete", style: .destructive) {
            print("Tapped")
        }
    }
    .padding()
}
