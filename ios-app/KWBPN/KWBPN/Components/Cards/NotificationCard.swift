//
//  NotificationCard.swift
//  KWBPN
//
//  Pickup notification card component
//

import SwiftUI

struct NotificationCard: View {

    // MARK: - Properties
    let notification: PickupNotification
    var userResponse: PickupResponse?
    var onTap: (() -> Void)?

    // MARK: - Body
    var body: some View {
        Button {
            onTap?()
        } label: {
            VStack(alignment: .leading, spacing: 12) {
                // Header
                HStack {
                    // Ward Badge
                    Label(notification.wardDisplayName, systemImage: "mappin.circle.fill")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Color.accentColor)
                        .cornerRadius(8)

                    Spacer()

                    // Status Badge
                    StatusBadge(status: notification.status)
                }

                // Date & Time
                HStack(spacing: 16) {
                    Label(notification.scheduledDate.displayString, systemImage: "calendar")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Label(notification.scheduledTime, systemImage: "clock")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                // Message Preview
                Text(notification.localizedMessage)
                    .font(.body)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                // Response Status
                if let response = userResponse {
                    ResponseStatusView(response: response)
                } else if notification.canRespond {
                    NoResponseView()
                }

                // Chevron indicator
                HStack {
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(Constants.UI.cardPadding)
            .background(Color.cardBackground)
            .cornerRadius(Constants.UI.cornerRadius)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Response Status View
struct ResponseStatusView: View {
    let response: PickupResponse

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: response.isYes ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundColor(response.isYes ? .success : .error)

            Text(response.statusText)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            (response.isYes ? Color.success : Color.error).opacity(0.1)
        )
        .cornerRadius(8)
    }
}

// MARK: - No Response View
struct NoResponseView: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.circle")
                .foregroundColor(.warning)

            Text("No response yet - tap to respond")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.warning.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Mini Notification Card (for History)
struct MiniNotificationCard: View {
    let notification: PickupNotification
    var userResponse: PickupResponse?
    var onTap: (() -> Void)?

    var body: some View {
        Button {
            onTap?()
        } label: {
            HStack(spacing: 12) {
                // Response indicator
                Circle()
                    .fill(responseColor)
                    .frame(width: 12, height: 12)

                // Content
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(notification.wardDisplayName)
                            .font(.subheadline)
                            .fontWeight(.medium)

                        Spacer()

                        Text(notification.scheduledDate.dayMonthString)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Text(notification.localizedMessage)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .padding(12)
            .background(Color.cardBackground)
            .cornerRadius(Constants.UI.cornerRadius)
        }
        .buttonStyle(.plain)
    }

    private var responseColor: Color {
        if let response = userResponse {
            return response.isYes ? .success : .error
        }
        return .gray
    }
}

// MARK: - Preview
#Preview {
    ScrollView {
        VStack(spacing: 16) {
            NotificationCard(
                notification: .mock,
                userResponse: nil
            )

            NotificationCard(
                notification: .mock,
                userResponse: .mock
            )

            MiniNotificationCard(
                notification: .mock,
                userResponse: .mock
            )

            MiniNotificationCard(
                notification: .mock,
                userResponse: nil
            )
        }
        .padding()
    }
    .background(Color.background)
}
