//
//  HistoryView.swift
//  KWBPN
//
//  Notification history list
//

import SwiftUI

struct HistoryView: View {

    // MARK: - Properties
    @StateObject private var viewModel = HistoryViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var router: Router

    // MARK: - Body
    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.notifications.isEmpty {
                loadingView
            } else if viewModel.notifications.isEmpty {
                emptyView
            } else {
                listView
            }
        }
        .background(Color.background)
        .navigationTitle("History")
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            if let customer = appState.currentCustomer {
                viewModel.setCustomer(customer)
                await viewModel.loadHistory()
            }
        }
    }

    // MARK: - Loading View
    private var loadingView: some View {
        ScrollView {
            VStack(spacing: 12) {
                ForEach(0..<5, id: \.self) { _ in
                    SkeletonView(height: 80)
                }
            }
            .padding()
        }
    }

    // MARK: - Empty View
    private var emptyView: some View {
        EmptyStateView(
            icon: "clock",
            title: "No History",
            message: "Your past pickup notifications will appear here. Check back after you receive your first notification."
        )
    }

    // MARK: - List View
    private var listView: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(groupedNotifications.keys.sorted().reversed(), id: \.self) { month in
                    Section {
                        ForEach(groupedNotifications[month] ?? []) { notification in
                            NavigationLink(value: Route.notificationDetail(notificationId: notification.id)) {
                                HistoryRow(
                                    notification: notification,
                                    response: viewModel.responses[notification.id]
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    } header: {
                        HStack {
                            Text(month)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                            Spacer()
                        }
                        .padding(.top, 8)
                    }
                }
            }
            .padding()
        }
        .navigationDestination(for: Route.self) { route in
            if case .notificationDetail(let id) = route {
                NotificationDetailView(notificationId: id)
            }
        }
    }

    // MARK: - Grouped Notifications
    private var groupedNotifications: [String: [PickupNotification]] {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"

        return Dictionary(grouping: viewModel.notifications) { notification in
            formatter.string(from: notification.scheduledDate)
        }
    }
}

// MARK: - History Row
struct HistoryRow: View {
    let notification: PickupNotification
    let response: PickupResponse?

    var body: some View {
        HStack(spacing: 16) {
            // Response indicator
            VStack {
                Circle()
                    .fill(responseColor)
                    .frame(width: 12, height: 12)

                if response != nil {
                    Rectangle()
                        .fill(responseColor.opacity(0.3))
                        .frame(width: 2)
                }
            }
            .frame(height: 60)

            // Content
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(notification.scheduledDate.displayString)
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    Spacer()

                    Text(notification.scheduledTime)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Text(notification.localizedMessage)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)

                // Response status
                if let response = response {
                    HStack(spacing: 4) {
                        Image(systemName: response.isYes ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .font(.caption2)

                        Text(response.isYes ? "Responded YES" : "Responded NO")
                            .font(.caption2)
                    }
                    .foregroundColor(response.isYes ? .success : .error)
                } else {
                    Text("No response")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            }

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(Constants.UI.cornerRadius)
    }

    private var responseColor: Color {
        if let response = response {
            return response.isYes ? .success : .error
        }
        return .gray
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        HistoryView()
            .environmentObject(AppState())
            .environmentObject(Router())
    }
}
