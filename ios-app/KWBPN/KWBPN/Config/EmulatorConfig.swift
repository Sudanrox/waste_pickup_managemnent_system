//
//  EmulatorConfig.swift
//  KWBPN
//
//  Firebase Emulator configuration for local development
//

import Foundation

struct EmulatorConfig {
    /// Enable emulator connections for local development
    static let useEmulators = true

    /// Host for emulators
    /// - Use "localhost" for iOS Simulator
    /// - Use your Mac's IP address for physical devices (e.g., "192.168.1.x")
    static let host = "localhost"

    /// Emulator ports (must match firebase.json)
    static let authPort = 9099
    static let firestorePort = 8080
    static let functionsPort = 5001
}
