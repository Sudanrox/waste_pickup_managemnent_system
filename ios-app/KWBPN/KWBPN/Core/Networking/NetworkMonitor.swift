//
//  NetworkMonitor.swift
//  KWBPN
//
//  Network connectivity monitoring for offline support
//

import Foundation
import Network
import Combine

@MainActor
final class NetworkMonitor: ObservableObject {

    // MARK: - Singleton
    static let shared = NetworkMonitor()

    // MARK: - Published Properties
    @Published private(set) var isConnected: Bool = true
    @Published private(set) var connectionType: ConnectionType = .unknown

    // MARK: - Private Properties
    private let monitor: NWPathMonitor
    private let queue = DispatchQueue(label: "NetworkMonitor")

    // MARK: - Connection Type
    enum ConnectionType {
        case wifi
        case cellular
        case ethernet
        case unknown

        var description: String {
            switch self {
            case .wifi: return "Wi-Fi"
            case .cellular: return "Cellular"
            case .ethernet: return "Ethernet"
            case .unknown: return "Unknown"
            }
        }
    }

    // MARK: - Initialization
    private init() {
        monitor = NWPathMonitor()
        startMonitoring()
    }

    deinit {
        stopMonitoring()
    }

    // MARK: - Monitoring
    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.updateConnectionStatus(path)
            }
        }
        monitor.start(queue: queue)
    }

    private func stopMonitoring() {
        monitor.cancel()
    }

    private func updateConnectionStatus(_ path: NWPath) {
        isConnected = path.status == .satisfied

        if path.usesInterfaceType(.wifi) {
            connectionType = .wifi
        } else if path.usesInterfaceType(.cellular) {
            connectionType = .cellular
        } else if path.usesInterfaceType(.wiredEthernet) {
            connectionType = .ethernet
        } else {
            connectionType = .unknown
        }

        Logger.info("Network status changed: \(isConnected ? "Connected" : "Disconnected") via \(connectionType.description)")
    }
}

// MARK: - Network Status View Modifier
import SwiftUI

struct NetworkStatusModifier: ViewModifier {
    @ObservedObject var networkMonitor = NetworkMonitor.shared

    func body(content: Content) -> some View {
        content
            .overlay(alignment: .top) {
                if !networkMonitor.isConnected {
                    HStack(spacing: 8) {
                        Image(systemName: "wifi.slash")
                            .font(.caption)
                        Text("No Internet Connection")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.warning)
                    .cornerRadius(20)
                    .padding(.top, 8)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .animation(.spring(), value: networkMonitor.isConnected)
                }
            }
    }
}

extension View {
    func showNetworkStatus() -> some View {
        modifier(NetworkStatusModifier())
    }
}
