//
//  ProfileView.swift
//  KWBPN
//
//  User profile and settings
//

import SwiftUI

struct ProfileView: View {

    // MARK: - Properties
    @EnvironmentObject var appState: AppState
    @State private var showLogoutConfirmation = false

    // MARK: - Body
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Profile Header
                profileHeader

                // Settings Sections
                accountSection
                preferencesSection
                aboutSection

                // Logout Button
                logoutButton
            }
            .padding()
        }
        .background(Color.background)
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.large)
        .confirmationDialog(
            "Are you sure you want to log out?",
            isPresented: $showLogoutConfirmation,
            titleVisibility: .visible
        ) {
            Button("Log Out", role: .destructive) {
                appState.signOut()
            }
            Button("Cancel", role: .cancel) {}
        }
    }

    // MARK: - Profile Header
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .fill(LinearGradient.brandGradient)
                    .frame(width: 80, height: 80)

                Text(appState.currentCustomer?.name.prefix(1).uppercased() ?? "U")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }

            // Name & Phone
            VStack(spacing: 4) {
                Text(appState.currentCustomer?.name ?? "User")
                    .font(.title2)
                    .fontWeight(.bold)

                Text(appState.currentCustomer?.phoneNumber.formattedPhoneNumber ?? "")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            // Ward Badge
            if let ward = appState.currentCustomer?.wardNumber {
                WardBadge(wardNumber: ward, size: .large)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color.cardBackground)
        .cornerRadius(Constants.UI.cornerRadius)
    }

    // MARK: - Account Section
    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Account")
                .font(.headline)
                .foregroundColor(.secondary)

            VStack(spacing: 0) {
                settingsRow(
                    icon: "person.fill",
                    title: "Edit Profile",
                    destination: .editProfile
                )

                Divider().padding(.leading, 52)

                settingsRow(
                    icon: "mappin.circle.fill",
                    title: "Change Ward",
                    subtitle: appState.currentCustomer?.wardDisplayName,
                    destination: .changeWard
                )
            }
            .background(Color.cardBackground)
            .cornerRadius(Constants.UI.cornerRadius)
        }
    }

    // MARK: - Preferences Section
    private var preferencesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Preferences")
                .font(.headline)
                .foregroundColor(.secondary)

            VStack(spacing: 0) {
                settingsRow(
                    icon: "globe",
                    title: "Language",
                    subtitle: appState.currentCustomer?.appLanguage.displayName,
                    destination: .languageSettings
                )

                Divider().padding(.leading, 52)

                NavigationLink {
                    NotificationSettingsView()
                } label: {
                    HStack(spacing: 16) {
                        Image(systemName: "bell.fill")
                            .font(.title3)
                            .foregroundColor(.accentColor)
                            .frame(width: 28)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Notifications")
                                .font(.body)
                                .foregroundColor(.primary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                }
            }
            .background(Color.cardBackground)
            .cornerRadius(Constants.UI.cornerRadius)
        }
    }

    // MARK: - About Section
    private var aboutSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("About")
                .font(.headline)
                .foregroundColor(.secondary)

            VStack(spacing: 0) {
                infoRow(icon: "info.circle.fill", title: "Version", value: Constants.App.version)

                Divider().padding(.leading, 52)

                NavigationLink {
                    Text("Privacy Policy")
                        .navigationTitle("Privacy Policy")
                } label: {
                    HStack(spacing: 16) {
                        Image(systemName: "lock.shield.fill")
                            .font(.title3)
                            .foregroundColor(.accentColor)
                            .frame(width: 28)

                        Text("Privacy Policy")
                            .font(.body)
                            .foregroundColor(.primary)

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                }

                Divider().padding(.leading, 52)

                NavigationLink {
                    Text("Terms of Service")
                        .navigationTitle("Terms of Service")
                } label: {
                    HStack(spacing: 16) {
                        Image(systemName: "doc.text.fill")
                            .font(.title3)
                            .foregroundColor(.accentColor)
                            .frame(width: 28)

                        Text("Terms of Service")
                            .font(.body)
                            .foregroundColor(.primary)

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                }
            }
            .background(Color.cardBackground)
            .cornerRadius(Constants.UI.cornerRadius)
        }
    }

    // MARK: - Logout Button
    private var logoutButton: some View {
        Button {
            showLogoutConfirmation = true
        } label: {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Log Out")
            }
            .font(.body)
            .fontWeight(.medium)
            .foregroundColor(.error)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.error.opacity(0.1))
            .cornerRadius(Constants.UI.cornerRadius)
        }
    }

    // MARK: - Helper Views
    private func settingsRow(
        icon: String,
        title: String,
        subtitle: String? = nil,
        destination: Route
    ) -> some View {
        NavigationLink(value: destination) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(.accentColor)
                    .frame(width: 28)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.body)
                        .foregroundColor(.primary)

                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
        }
    }

    private func infoRow(icon: String, title: String, value: String) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.accentColor)
                .frame(width: 28)

            Text(title)
                .font(.body)

            Spacer()

            Text(value)
                .font(.body)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

// MARK: - Notification Settings View (Placeholder)
struct NotificationSettingsView: View {
    var body: some View {
        List {
            Section {
                Text("Push notifications are managed through your device settings.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Section {
                Button("Open Settings") {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                }
            }
        }
        .navigationTitle("Notifications")
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        ProfileView()
            .environmentObject(AppState())
    }
}
