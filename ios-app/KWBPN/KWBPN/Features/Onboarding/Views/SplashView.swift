//
//  SplashView.swift
//  KWPM
//
//  App launch splash screen
//

import SwiftUI

struct SplashView: View {

    // MARK: - State
    @State private var isAnimating = false
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0

    // MARK: - Body
    var body: some View {
        ZStack {
            // Background gradient (matches logo)
            LinearGradient.brandGradient
                .ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                // Logo Container
                ZStack {
                    // White circle background (like in logo)
                    Circle()
                        .fill(.white)
                        .frame(width: 160, height: 160)
                        .shadow(color: .black.opacity(0.1), radius: 20, x: 0, y: 10)

                    // Logo Image (when added to assets)
                    // Image("AppLogo")
                    //     .resizable()
                    //     .scaledToFit()
                    //     .frame(width: 140, height: 140)

                    // Placeholder icon (until logo asset is added)
                    VStack(spacing: 4) {
                        Image(systemName: "truck.box.fill")
                            .font(.system(size: 50))
                            .foregroundStyle(LinearGradient.brandGradientHorizontal)

                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.gradientEnd)
                    }
                }
                .scaleEffect(logoScale)
                .opacity(logoOpacity)

                // App Name
                VStack(spacing: 8) {
                    Text(Constants.App.name)
                        .font(.system(size: 42, weight: .bold, design: .rounded))
                        .foregroundColor(.white)

                    Text(Constants.App.fullName)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white.opacity(0.9))
                        .multilineTextAlignment(.center)

                    Text(Constants.App.tagline)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                        .padding(.top, 4)
                }
                .opacity(isAnimating ? 1.0 : 0.0)

                Spacer()
                Spacer()

                // Loading indicator
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.2)
                    .opacity(isAnimating ? 1.0 : 0.0)

                Spacer()
            }
            .padding()
        }
        .onAppear {
            // Animate logo
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6)) {
                logoScale = 1.0
                logoOpacity = 1.0
            }

            // Animate text
            withAnimation(.easeOut(duration: 0.8).delay(0.3)) {
                isAnimating = true
            }
        }
    }
}

// MARK: - Preview
#Preview {
    SplashView()
}
