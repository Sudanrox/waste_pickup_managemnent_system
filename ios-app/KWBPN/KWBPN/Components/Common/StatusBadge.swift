//
//  StatusBadge.swift
//  KWBPN
//
//  Status badge components
//

import SwiftUI

// MARK: - Notification Status Badge
struct StatusBadge: View {
    let status: Constants.NotificationStatus

    var body: some View {
        Text(status.displayText)
            .font(.caption2)
            .fontWeight(.semibold)
            .foregroundColor(foregroundColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(backgroundColor)
            .cornerRadius(6)
    }

    private var backgroundColor: Color {
        switch status {
        case .scheduled: return .blue.opacity(0.15)
        case .sent: return .green.opacity(0.15)
        case .completed: return .gray.opacity(0.15)
        case .cancelled: return .red.opacity(0.15)
        }
    }

    private var foregroundColor: Color {
        switch status {
        case .scheduled: return .blue
        case .sent: return .green
        case .completed: return .gray
        case .cancelled: return .red
        }
    }
}

// MARK: - Response Type Badge
struct ResponseBadge: View {
    let response: Constants.ResponseType

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: iconName)
                .font(.caption2)

            Text(response.displayText)
                .font(.caption)
                .fontWeight(.semibold)
        }
        .foregroundColor(foregroundColor)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(backgroundColor)
        .cornerRadius(8)
    }

    private var iconName: String {
        response == .yes ? "checkmark" : "xmark"
    }

    private var backgroundColor: Color {
        response == .yes ? .success.opacity(0.15) : .error.opacity(0.15)
    }

    private var foregroundColor: Color {
        response == .yes ? .success : .error
    }
}

// MARK: - Ward Badge
struct WardBadge: View {
    let wardNumber: Int
    var size: Size = .regular

    enum Size {
        case small
        case regular
        case large

        var font: Font {
            switch self {
            case .small: return .caption2
            case .regular: return .caption
            case .large: return .subheadline
            }
        }

        var padding: EdgeInsets {
            switch self {
            case .small: return EdgeInsets(top: 4, leading: 6, bottom: 4, trailing: 6)
            case .regular: return EdgeInsets(top: 6, leading: 10, bottom: 6, trailing: 10)
            case .large: return EdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12)
            }
        }
    }

    var body: some View {
        Label("Ward \(wardNumber)", systemImage: "mappin.circle.fill")
            .font(size.font)
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .padding(size.padding)
            .background(Color.accentColor)
            .cornerRadius(8)
    }
}

// MARK: - Count Badge
struct CountBadge: View {
    let count: Int
    var color: Color = .accentColor

    var body: some View {
        Text("\(count)")
            .font(.caption2)
            .fontWeight(.bold)
            .foregroundColor(.white)
            .frame(minWidth: 20, minHeight: 20)
            .background(color)
            .clipShape(Circle())
    }
}

// MARK: - Online/Offline Badge
struct ConnectionBadge: View {
    let isOnline: Bool

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(isOnline ? Color.success : Color.warning)
                .frame(width: 8, height: 8)

            Text(isOnline ? "Online" : "Offline")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 24) {
        // Status Badges
        HStack(spacing: 8) {
            StatusBadge(status: .scheduled)
            StatusBadge(status: .sent)
            StatusBadge(status: .completed)
            StatusBadge(status: .cancelled)
        }

        // Response Badges
        HStack(spacing: 8) {
            ResponseBadge(response: .yes)
            ResponseBadge(response: .no)
        }

        // Ward Badges
        HStack(spacing: 8) {
            WardBadge(wardNumber: 5, size: .small)
            WardBadge(wardNumber: 5, size: .regular)
            WardBadge(wardNumber: 5, size: .large)
        }

        // Count Badges
        HStack(spacing: 8) {
            CountBadge(count: 3)
            CountBadge(count: 12, color: .error)
            CountBadge(count: 99, color: .success)
        }

        // Connection Badges
        HStack(spacing: 16) {
            ConnectionBadge(isOnline: true)
            ConnectionBadge(isOnline: false)
        }
    }
    .padding()
}
