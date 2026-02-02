//
//  HomeView.swift
//  KWBPN
//
//  Main home screen showing latest notification
//

import SwiftUI

struct HomeView: View {

    // MARK: - Properties
    @StateObject private var viewModel = HomeViewModel()
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var router: Router

    // MARK: - Body
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                headerSection

                // Content
                if viewModel.isLoading && viewModel.latestNotification == nil {
                    loadingSection
                } else if let notification = viewModel.latestNotification {
                    notificationSection(notification)
                } else {
                    emptySection
                }

                // Upcoming Notifications
                if !viewModel.upcomingNotifications.isEmpty {
                    upcomingSection
                }
            }
            .padding()
        }
        .background(Color.background)
        .refreshable {
            await viewModel.refresh()
        }
        .navigationTitle("Home")
        .navigationBarTitleDisplayMode(.large)
        .task {
            if let customer = appState.currentCustomer {
                viewModel.setCustomer(customer)
                await viewModel.loadNotifications()
            }
        }
        .onChange(of: appState.currentCustomer) { _, newCustomer in
            if let customer = newCustomer {
                viewModel.setCustomer(customer)
                Task {
                    await viewModel.loadNotifications()
                }
            }
        }
    }

    // MARK: - Header Section
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Welcome back,")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Text(appState.currentCustomer?.name ?? "User")
                    .font(.title2)
                    .fontWeight(.bold)
            }

            Spacer()

            // Ward Badge
            if let ward = appState.currentCustomer?.wardNumber {
                WardBadge(wardNumber: ward, size: .regular)
            }
        }
    }

    // MARK: - Loading Section
    private var loadingSection: some View {
        VStack(spacing: 16) {
            SkeletonCard()
            SkeletonCard()
        }
    }

    // MARK: - Notification Section
    private func notificationSection(_ notification: PickupNotification) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section Header
            HStack {
                Text("Latest Pickup")
                    .font(.headline)

                Spacer()

                if notification.canRespond {
                    Text("Action Required")
                        .font(.caption)
                        .foregroundColor(.warning)
                        .fontWeight(.semibold)
                }
            }

            // Notification Card (Expanded)
            VStack(alignment: .leading, spacing: 16) {
                // Status Row
                HStack {
                    WardBadge(wardNumber: notification.wardNumber, size: .small)
                    Spacer()
                    StatusBadge(status: notification.status)
                }

                // Date & Time
                HStack(spacing: 20) {
                    Label {
                        Text(notification.scheduledDate.displayString)
                            .fontWeight(.medium)
                    } icon: {
                        Image(systemName: "calendar")
                            .foregroundColor(.accentColor)
                    }

                    Label {
                        Text(notification.scheduledTime)
                            .fontWeight(.medium)
                    } icon: {
                        Image(systemName: "clock")
                            .foregroundColor(.accentColor)
                    }
                }
                .font(.subheadline)

                // Message
                Text(notification.localizedMessage)
                    .font(.body)
                    .foregroundColor(.secondary)

                Divider()

                // Response Section
                if notification.canRespond {
                    responseSection(notification)
                } else if let response = viewModel.userResponse {
                    ResponseStatusView(response: response)
                }

                // View Details Button
                Button {
                    router.navigate(to: .notificationDetail(notificationId: notification.id))
                } label: {
                    HStack {
                        Text("View Details")
                        Image(systemName: "chevron.right")
                    }
                    .font(.subheadline)
                    .fontWeight(.medium)
                }
            }
            .padding(Constants.UI.cardPadding)
            .background(Color.cardBackground)
            .cornerRadius(Constants.UI.cornerRadius)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
        }
    }

    // MARK: - Response Section
    private func responseSection(_ notification: PickupNotification) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Will you be available?")
                .font(.subheadline)
                .foregroundColor(.secondary)

            ResponseButtonPair(
                currentResponse: viewModel.userResponse?.response,
                isLoading: viewModel.isSubmittingResponse
            ) { response in
                Task {
                    await viewModel.submitResponse(response, for: notification)
                }
            }
        }
    }

    // MARK: - Empty Section
    private var emptySection: some View {
        VStack(spacing: 16) {
            Image(systemName: "bell.slash")
                .font(.system(size: 50))
                .foregroundColor(.secondary.opacity(0.5))

            Text("No Scheduled Pickups")
                .font(.headline)

            Text("There are no upcoming pickups scheduled for your ward. We'll notify you when one is scheduled.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(32)
        .frame(maxWidth: .infinity)
        .background(Color.cardBackground)
        .cornerRadius(Constants.UI.cornerRadius)
    }

    // MARK: - Upcoming Section
    private var upcomingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Upcoming")
                .font(.headline)

            ForEach(viewModel.upcomingNotifications) { notification in
                MiniNotificationCard(
                    notification: notification,
                    userResponse: viewModel.responses[notification.id]
                ) {
                    router.navigate(to: .notificationDetail(notificationId: notification.id))
                }
            }
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        HomeView()
            .environmentObject(AppState())
            .environmentObject(Router())
    }
}
