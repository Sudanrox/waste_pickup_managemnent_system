//
//  MainTabView.swift
//  KWBPN
//
//  Main tab navigation for authenticated users
//

import SwiftUI

struct MainTabView: View {

    // MARK: - Properties
    @EnvironmentObject var router: Router
    @EnvironmentObject var appState: AppState

    // MARK: - Body
    var body: some View {
        TabView(selection: $router.selectedTab) {
            // Home Tab
            NavigationStack(path: $router.path) {
                HomeView()
                    .navigationDestination(for: Route.self) { route in
                        destinationView(for: route)
                    }
            }
            .tabItem {
                Label(Router.TabItem.home.title, systemImage: Router.TabItem.home.icon)
            }
            .tag(Router.TabItem.home)

            // History Tab
            NavigationStack {
                HistoryView()
            }
            .tabItem {
                Label(Router.TabItem.history.title, systemImage: Router.TabItem.history.icon)
            }
            .tag(Router.TabItem.history)

            // Profile Tab
            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Label(Router.TabItem.profile.title, systemImage: Router.TabItem.profile.icon)
            }
            .tag(Router.TabItem.profile)
        }
        .tint(.accentColor)
        .showNetworkStatus()
        .onAppear {
            setupTabBarAppearance()
            setupDeepLinkHandler()
        }
    }

    // MARK: - Destination View Builder
    @ViewBuilder
    private func destinationView(for route: Route) -> some View {
        switch route {
        case .home:
            HomeView()
        case .notificationDetail(let id):
            NotificationDetailView(notificationId: id)
        case .history:
            HistoryView()
        case .profile:
            ProfileView()
        case .editProfile:
            EditProfileView()
        case .changeWard:
            ChangeWardView()
        case .languageSettings:
            LanguageSettingsView()
        }
    }

    // MARK: - Setup
    private func setupTabBarAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithDefaultBackground()
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }

    private func setupDeepLinkHandler() {
        DeepLinkHandler.shared.setRouter(router)
    }
}

// MARK: - Placeholder Views (to be implemented)
struct EditProfileView: View {
    var body: some View {
        Text("Edit Profile")
            .navigationTitle("Edit Profile")
    }
}

struct ChangeWardView: View {
    var body: some View {
        Text("Change Ward")
            .navigationTitle("Change Ward")
    }
}

struct LanguageSettingsView: View {
    var body: some View {
        Text("Language Settings")
            .navigationTitle("Language")
    }
}

// MARK: - Preview
#Preview {
    MainTabView()
        .environmentObject(Router())
        .environmentObject(AppState())
}
