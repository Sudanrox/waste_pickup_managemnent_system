//
//  Logger.swift
//  KWBPN
//
//  Centralized logging utility
//

import Foundation
import os.log

enum Logger {

    // MARK: - Log Levels
    enum Level: String {
        case debug = "🔍 DEBUG"
        case info = "ℹ️ INFO"
        case warning = "⚠️ WARNING"
        case error = "❌ ERROR"
    }

    // MARK: - Private Logger
    private static let osLog = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "KWBPN", category: "App")

    // MARK: - Logging Methods
    static func debug(
        _ message: String,
        file: String = #file,
        function: String = #function,
        line: Int = #line
    ) {
        log(level: .debug, message: message, file: file, function: function, line: line)
    }

    static func info(
        _ message: String,
        file: String = #file,
        function: String = #function,
        line: Int = #line
    ) {
        log(level: .info, message: message, file: file, function: function, line: line)
    }

    static func warning(
        _ message: String,
        file: String = #file,
        function: String = #function,
        line: Int = #line
    ) {
        log(level: .warning, message: message, file: file, function: function, line: line)
    }

    static func error(
        _ message: String,
        file: String = #file,
        function: String = #function,
        line: Int = #line
    ) {
        log(level: .error, message: message, file: file, function: function, line: line)
    }

    // MARK: - Private Log Implementation
    private static func log(
        level: Level,
        message: String,
        file: String,
        function: String,
        line: Int
    ) {
        let fileName = (file as NSString).lastPathComponent
        let logMessage = "\(level.rawValue) [\(fileName):\(line)] \(function) - \(message)"

        #if DEBUG
        print(logMessage)
        #endif

        // Also log to system log
        let osLogType: OSLogType
        switch level {
        case .debug: osLogType = .debug
        case .info: osLogType = .info
        case .warning: osLogType = .default
        case .error: osLogType = .error
        }

        os_log("%{public}@", log: osLog, type: osLogType, logMessage)
    }
}

// MARK: - Performance Logging
extension Logger {

    static func measureTime<T>(
        _ operation: String,
        block: () throws -> T
    ) rethrows -> T {
        let start = CFAbsoluteTimeGetCurrent()
        let result = try block()
        let elapsed = CFAbsoluteTimeGetCurrent() - start
        info("\(operation) completed in \(String(format: "%.3f", elapsed))s")
        return result
    }

    static func measureTime<T>(
        _ operation: String,
        block: () async throws -> T
    ) async rethrows -> T {
        let start = CFAbsoluteTimeGetCurrent()
        let result = try await block()
        let elapsed = CFAbsoluteTimeGetCurrent() - start
        info("\(operation) completed in \(String(format: "%.3f", elapsed))s")
        return result
    }
}
