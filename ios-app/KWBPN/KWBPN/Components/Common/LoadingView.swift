//
//  LoadingView.swift
//  KWBPN
//
//  Loading indicator components
//

import SwiftUI

// MARK: - Full Screen Loading
struct LoadingView: View {
    var message: String?

    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(1.2)

            if let message = message {
                Text(message)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.background)
    }
}

// MARK: - Inline Loading
struct InlineLoadingView: View {
    var message: String = "Loading..."

    var body: some View {
        HStack(spacing: 12) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())

            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

// MARK: - Skeleton Loading
struct SkeletonView: View {
    var width: CGFloat? = nil
    var height: CGFloat = 20

    @State private var isAnimating = false

    var body: some View {
        RoundedRectangle(cornerRadius: 4)
            .fill(Color.gray.opacity(0.2))
            .frame(width: width, height: height)
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.clear,
                                Color.white.opacity(0.3),
                                Color.clear
                            ]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .offset(x: isAnimating ? 200 : -200)
            )
            .clipped()
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    isAnimating = true
                }
            }
    }
}

// MARK: - Skeleton Card
struct SkeletonCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SkeletonView(width: 80, height: 24)
                Spacer()
                SkeletonView(width: 60, height: 20)
            }

            SkeletonView(width: 150, height: 16)
            SkeletonView(height: 16)
            SkeletonView(width: 200, height: 16)

            SkeletonView(width: 180, height: 32)
        }
        .padding(Constants.UI.cardPadding)
        .background(Color.cardBackground)
        .cornerRadius(Constants.UI.cornerRadius)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 24) {
        LoadingView(message: "Loading notifications...")

        Divider()

        InlineLoadingView()

        Divider()

        VStack(alignment: .leading, spacing: 8) {
            SkeletonView(width: 100, height: 20)
            SkeletonView(height: 16)
            SkeletonView(width: 150, height: 16)
        }
        .padding()

        Divider()

        SkeletonCard()
            .padding()
    }
}
