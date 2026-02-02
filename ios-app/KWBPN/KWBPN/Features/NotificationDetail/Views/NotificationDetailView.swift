//
//  NotificationDetailView.swift
//  KWBPN
//
//  Full notification detail with response actions
//

import SwiftUI

struct NotificationDetailView: View {

    // MARK: - Properties
    let notificationId: String
    @StateObject private var viewModel = NotificationDetailViewModel()
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss

    // MARK: - Body
    var body: some View {
        ScrollView {
            if viewModel.isLoading && viewModel.notification == nil {
                loadingView
            } else if let notification = viewModel.notification {
                contentView(notification)
            } else if viewModel.error != nil {
                errorView
            }
        }
        .background(Color.background)
        .navigationTitle("Pickup Details")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if let customer = appState.currentCustomer {
                viewModel.setCustomer(customer)
                await viewModel.loadNotification(id: notificationId)
            }
        }
    }

    // MARK: - Loading View
    private var loadingView: some View {
        VStack(spacing: 16) {
            SkeletonCard()
            SkeletonView(height: 120)
        }
        .padding()
    }

    // MARK: - Content View
    private func contentView(_ notification: PickupNotification) -> some View {
        VStack(alignment: .leading, spacing: 24) {
            // Header Card
            headerCard(notification)

            // Message Section
            messageSection(notification)

            // Response Section
            responseSection(notification)

            // Stats Section (if available)
            if notification.status == .sent || notification.status == .completed {
                statsSection(notification)
            }

            // Info Section
            infoSection(notification)
        }
        .padding()
    }

    // MARK: - Header Card
    private func headerCard(_ notification: PickupNotification) -> some View {
        VStack(spacing: 16) {
            // Icon
            Image(systemName: "trash.circle.fill")
                .font(.system(size: 60))
                .foregroundStyle(LinearGradient.brandGradient)

            // Ward & Status
            HStack(spacing: 12) {
                WardBadge(wardNumber: notification.wardNumber, size: .large)
                StatusBadge(status: notification.status)
            }

            // Date & Time
            VStack(spacing: 4) {
                Text(notification.scheduledDate.displayString)
                    .font(.title2)
                    .fontWeight(.bold)

                Text("at \(notification.scheduledTime)")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color.cardBackground)
        .cornerRadius(Constants.UI.cornerRadius)
    }

    // MARK: - Message Section
    private func messageSection(_ notification: PickupNotification) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Message")
                .font(.headline)

            Text(notification.localizedMessage)
                .font(.body)
                .foregroundColor(.secondary)
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.secondaryBackground)
                .cornerRadius(Constants.UI.cornerRadius)
        }
    }

    // MARK: - Response Section
    private func responseSection(_ notification: PickupNotification) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Your Response")
                    .font(.headline)

                Spacer()

                if let response = viewModel.userResponse {
                    ResponseBadge(response: response.response)
                }
            }

            if notification.canRespond {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Will you be available for the pickup?")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    ResponseButtonPair(
                        currentResponse: viewModel.userResponse?.response,
                        isLoading: viewModel.isSubmittingResponse
                    ) { response in
                        Task {
                            await viewModel.submitResponse(response)
                        }
                    }
                }
            } else if let response = viewModel.userResponse {
                // Show response details
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Image(systemName: response.isYes ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundColor(response.isYes ? .success : .error)
                            .font(.title2)

                        Text(response.isYes ? "You responded YES" : "You responded NO")
                            .font(.body)
                            .fontWeight(.medium)
                    }

                    Text("Responded at \(response.respondedAt.smartDisplayString)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background((response.isYes ? Color.success : Color.error).opacity(0.1))
                .cornerRadius(Constants.UI.cornerRadius)
            } else {
                // No response and can't respond
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle")
                        .foregroundColor(.warning)

                    Text("Response period has ended")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.warning.opacity(0.1))
                .cornerRadius(Constants.UI.cornerRadius)
            }
        }
    }

    // MARK: - Stats Section
    private func statsSection(_ notification: PickupNotification) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Community Response")
                .font(.headline)

            HStack(spacing: 16) {
                statCard(
                    value: "\(notification.responseStats.yesCount)",
                    label: "Yes",
                    color: .success
                )

                statCard(
                    value: "\(notification.responseStats.noCount)",
                    label: "No",
                    color: .error
                )

                statCard(
                    value: "\(notification.responseStats.noResponseCount)",
                    label: "Pending",
                    color: .gray
                )
            }

            // Response rate
            HStack {
                Text("Response Rate")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Text("\(Int(notification.responseStats.responseRate))%")
                    .font(.caption)
                    .fontWeight(.semibold)
            }

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 8)
                        .cornerRadius(4)

                    Rectangle()
                        .fill(Color.accentColor)
                        .frame(
                            width: geometry.size.width * notification.responseStats.responseRate / 100,
                            height: 8
                        )
                        .cornerRadius(4)
                }
            }
            .frame(height: 8)
        }
        .padding()
        .background(Color.cardBackground)
        .cornerRadius(Constants.UI.cornerRadius)
    }

    private func statCard(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)

            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(color.opacity(0.1))
        .cornerRadius(Constants.UI.cornerRadius)
    }

    // MARK: - Info Section
    private func infoSection(_ notification: PickupNotification) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Information")
                .font(.headline)

            VStack(spacing: 12) {
                infoRow(icon: "calendar", label: "Scheduled", value: notification.scheduledDate.displayString)
                infoRow(icon: "clock", label: "Time", value: notification.scheduledTime)
                infoRow(icon: "mappin.circle", label: "Ward", value: notification.wardDisplayName)
                infoRow(icon: "bell", label: "Sent", value: notification.sentAt?.smartDisplayString ?? "Not sent")

                if notification.isRescheduled {
                    infoRow(icon: "arrow.triangle.2.circlepath", label: "Status", value: "Rescheduled")
                }
            }
            .padding()
            .background(Color.secondaryBackground)
            .cornerRadius(Constants.UI.cornerRadius)
        }
    }

    private func infoRow(icon: String, label: String, value: String) -> some View {
        HStack {
            Label(label, systemImage: icon)
                .font(.subheadline)
                .foregroundColor(.secondary)

            Spacer()

            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }

    // MARK: - Error View
    private var errorView: some View {
        ErrorView(error: viewModel.error ?? .unknown("")) {
            Task {
                await viewModel.loadNotification(id: notificationId)
            }
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        NotificationDetailView(notificationId: "notif_123")
            .environmentObject(AppState())
    }
}
