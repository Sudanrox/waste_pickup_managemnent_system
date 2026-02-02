//
//  Colors.swift
//  KWBPN
//
//  App color definitions
//

import SwiftUI

// MARK: - Color Extension
extension Color {

    // MARK: - Brand Colors
    static let brandPrimary = Color("BrandPrimary", bundle: nil)
    static let brandSecondary = Color("BrandSecondary", bundle: nil)

    // MARK: - Semantic Colors
    static let success = Color(red: 34/255, green: 197/255, blue: 94/255)     // Green
    static let warning = Color(red: 234/255, green: 179/255, blue: 8/255)      // Yellow/Amber
    static let error = Color(red: 239/255, green: 68/255, blue: 68/255)        // Red
    static let info = Color(red: 59/255, green: 130/255, blue: 246/255)        // Blue

    // MARK: - Background Colors
    static let background = Color(uiColor: .systemBackground)
    static let secondaryBackground = Color(uiColor: .secondarySystemBackground)
    static let tertiaryBackground = Color(uiColor: .tertiarySystemBackground)
    static let cardBackground = Color(uiColor: .systemBackground)

    // MARK: - Text Colors
    static let textPrimary = Color(uiColor: .label)
    static let textSecondary = Color(uiColor: .secondaryLabel)
    static let textTertiary = Color(uiColor: .tertiaryLabel)

    // MARK: - Accent Colors (App Theme - KWPM Branding)
    // Primary green from logo
    static let appAccent = Color(red: 39/255, green: 125/255, blue: 76/255)   // KWPM Green
    static let appBlue = Color(red: 59/255, green: 154/255, blue: 178/255)    // KWPM Blue

    // MARK: - Gradient Colors (Blue to Green - matches logo)
    static let gradientStart = Color(red: 59/255, green: 154/255, blue: 178/255)  // Sky Blue
    static let gradientMiddle = Color(red: 86/255, green: 171/255, blue: 145/255) // Teal
    static let gradientEnd = Color(red: 118/255, green: 184/255, blue: 82/255)    // Fresh Green
}

// MARK: - Color Scheme Helper
extension Color {

    // Light/Dark mode aware colors
    static func adaptive(light: Color, dark: Color) -> Color {
        Color(uiColor: UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(dark)
                : UIColor(light)
        })
    }
}

// MARK: - Gradient Definitions
extension LinearGradient {

    // Main brand gradient (blue to green - matches KWPM logo)
    static let brandGradient = LinearGradient(
        gradient: Gradient(colors: [.gradientStart, .gradientMiddle, .gradientEnd]),
        startPoint: .top,
        endPoint: .bottom
    )

    // Horizontal variant
    static let brandGradientHorizontal = LinearGradient(
        gradient: Gradient(colors: [.gradientStart, .gradientMiddle, .gradientEnd]),
        startPoint: .leading,
        endPoint: .trailing
    )

    static let successGradient = LinearGradient(
        gradient: Gradient(colors: [
            Color(red: 34/255, green: 197/255, blue: 94/255),
            Color(red: 22/255, green: 163/255, blue: 74/255)
        ]),
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let errorGradient = LinearGradient(
        gradient: Gradient(colors: [
            Color(red: 239/255, green: 68/255, blue: 68/255),
            Color(red: 220/255, green: 38/255, blue: 38/255)
        ]),
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

// MARK: - Preview
#Preview {
    ScrollView {
        VStack(spacing: 16) {
            Group {
                Text("Semantic Colors")
                    .font(.headline)

                HStack(spacing: 8) {
                    ColorSwatch(color: .success, name: "Success")
                    ColorSwatch(color: .warning, name: "Warning")
                    ColorSwatch(color: .error, name: "Error")
                    ColorSwatch(color: .info, name: "Info")
                }
            }

            Divider()

            Group {
                Text("Background Colors")
                    .font(.headline)

                HStack(spacing: 8) {
                    ColorSwatch(color: .background, name: "BG")
                    ColorSwatch(color: .secondaryBackground, name: "Sec BG")
                    ColorSwatch(color: .tertiaryBackground, name: "Ter BG")
                }
            }

            Divider()

            Group {
                Text("Gradients")
                    .font(.headline)

                RoundedRectangle(cornerRadius: 12)
                    .fill(LinearGradient.brandGradient)
                    .frame(height: 60)

                HStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(LinearGradient.successGradient)
                        .frame(height: 60)

                    RoundedRectangle(cornerRadius: 12)
                        .fill(LinearGradient.errorGradient)
                        .frame(height: 60)
                }
            }
        }
        .padding()
    }
}

// Helper for preview
struct ColorSwatch: View {
    let color: Color
    let name: String

    var body: some View {
        VStack(spacing: 4) {
            RoundedRectangle(cornerRadius: 8)
                .fill(color)
                .frame(width: 60, height: 60)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )

            Text(name)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}
