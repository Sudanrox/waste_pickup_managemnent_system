//
//  ErrorView.swift
//  KWBPN
//
//  Error display components
//

import SwiftUI

// MARK: - Full Screen Error
struct ErrorView: View {
    let error: AppError
    var retryAction: (() -> Void)?

    var body: some View {
        VStack(spacing: 24) {
            // Icon
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 60))
                .foregroundColor(.warning)

            // Message
            VStack(spacing: 8) {
                Text("Something went wrong")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text(error.errorDescription ?? "An unknown error occurred")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)

                if let suggestion = error.recoverySuggestion {
                    Text(suggestion)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, 4)
                }
            }

            // Retry Button
            if let retry = retryAction {
                PrimaryButton(title: "Try Again") {
                    retry()
                }
                .frame(width: 200)
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.background)
    }
}

// MARK: - Inline Error
struct InlineErrorView: View {
    let message: String
    var retryAction: (() -> Void)?

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundColor(.error)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)

            Spacer()

            if let retry = retryAction {
                Button("Retry") {
                    retry()
                }
                .font(.subheadline)
                .fontWeight(.medium)
            }
        }
        .padding()
        .background(Color.error.opacity(0.1))
        .cornerRadius(Constants.UI.cornerRadius)
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.secondary.opacity(0.5))

            VStack(spacing: 8) {
                Text(title)
                    .font(.title3)
                    .fontWeight(.semibold)

                Text(message)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            if let actionTitle = actionTitle, let action = action {
                PrimaryButton(title: actionTitle, style: .secondary) {
                    action()
                }
                .frame(width: 200)
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - No Notifications Empty State
struct NoNotificationsView: View {
    var body: some View {
        EmptyStateView(
            icon: "bell.slash",
            title: "No Notifications",
            message: "You don't have any pickup notifications yet. We'll notify you when one is scheduled for your ward."
        )
    }
}

// MARK: - No Internet View
struct NoInternetView: View {
    var retryAction: (() -> Void)?

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "wifi.slash")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            VStack(spacing: 8) {
                Text("No Internet Connection")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("Please check your network connection and try again")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            if let retry = retryAction {
                PrimaryButton(title: "Try Again") {
                    retry()
                }
                .frame(width: 200)
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.background)
    }
}

// MARK: - Preview
#Preview {
    VStack {
        ErrorView(error: .noInternetConnection) {
            print("Retry")
        }
    }
}
