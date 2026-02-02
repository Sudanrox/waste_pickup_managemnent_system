//
//  OnboardingView.swift
//  KWBPN
//
//  Welcome and authentication flow
//

import SwiftUI

struct OnboardingView: View {

    // MARK: - State
    @StateObject private var viewModel = OnboardingViewModel()
    @State private var currentPage = 0

    // MARK: - Body
    var body: some View {
        NavigationStack(path: $viewModel.navigationPath) {
            welcomeContent
                .navigationDestination(for: OnboardingStep.self) { step in
                    switch step {
                    case .phoneInput:
                        PhoneInputView(viewModel: viewModel)
                    case .otpVerification:
                        OTPVerificationView(viewModel: viewModel)
                    }
                }
        }
    }

    // MARK: - Welcome Content
    private var welcomeContent: some View {
        VStack(spacing: 0) {
            // Hero Section
            VStack(spacing: 24) {
                Spacer()

                // Logo
                ZStack {
                    Circle()
                        .fill(.white)
                        .frame(width: 120, height: 120)
                        .shadow(color: .black.opacity(0.08), radius: 16, x: 0, y: 8)

                    // Placeholder (replace with actual logo)
                    VStack(spacing: 2) {
                        Image(systemName: "truck.box.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(LinearGradient.brandGradientHorizontal)

                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.gradientEnd)
                    }
                }

                // Title
                VStack(spacing: 12) {
                    Text("Welcome to \(Constants.App.name)")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Get notified about waste pickup schedules in your ward and respond with a single tap.")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                Spacer()
            }
            .frame(maxWidth: .infinity)

            // Features List
            VStack(spacing: 16) {
                FeatureRow(
                    icon: "bell.fill",
                    title: "Real-time Notifications",
                    description: "Get instant alerts for your ward"
                )

                FeatureRow(
                    icon: "hand.tap.fill",
                    title: "Quick Response",
                    description: "Respond YES or NO with one tap"
                )

                FeatureRow(
                    icon: "globe",
                    title: "Nepali & English",
                    description: "Use in your preferred language"
                )
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)

            // CTA Button
            VStack(spacing: 16) {
                PrimaryButton(title: "Get Started") {
                    viewModel.navigateTo(.phoneInput)
                }

                Text("By continuing, you agree to our Terms of Service")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(24)
        }
        .background(Color.background)
    }
}

// MARK: - Feature Row
struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.accentColor)
                .frame(width: 44, height: 44)
                .background(Color.accentColor.opacity(0.1))
                .cornerRadius(12)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
    }
}

// MARK: - Onboarding Step Enum
enum OnboardingStep: Hashable {
    case phoneInput
    case otpVerification
}

// MARK: - Preview
#Preview {
    OnboardingView()
}
