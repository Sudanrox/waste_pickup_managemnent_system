//
//  KWBPNApp.swift
//  KWBPN
//
//  Kathmandu Ward Based Pickup Notifier
//

import SwiftUI
import FirebaseCore

@main
struct KWBPNApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    @StateObject private var appState = AppState()
    @StateObject private var router = Router()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
                .environmentObject(router)
                .preferredColorScheme(appState.colorScheme)
        }
    }
}

// MARK: - Root View
struct RootView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            switch appState.authState {
            case .loading:
                SplashView()
            case .unauthenticated:
                OnboardingView()
            case .authenticated:
                MainTabView()
            case .needsProfile:
                ProfileSetupView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: appState.authState)
    }
}

// MARK: - Preview
#Preview {
    RootView()
        .environmentObject(AppState())
        .environmentObject(Router())
}
