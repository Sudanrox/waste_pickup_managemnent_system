//
//  Date+Extensions.swift
//  KWBPN
//
//  Date formatting and manipulation utilities
//

import Foundation

extension Date {

    // MARK: - Formatters (Cached for performance)
    private static let displayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = Constants.DateFormat.display
        return formatter
    }()

    private static let displayWithTimeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = Constants.DateFormat.displayWithTime
        return formatter
    }()

    private static let timeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = Constants.DateFormat.time
        return formatter
    }()

    private static let dayMonthFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = Constants.DateFormat.dayMonth
        return formatter
    }()

    private static let relativeFormatter: RelativeDateTimeFormatter = {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter
    }()

    // MARK: - Formatted Strings
    var displayString: String {
        Date.displayFormatter.string(from: self)
    }

    var displayWithTimeString: String {
        Date.displayWithTimeFormatter.string(from: self)
    }

    var timeString: String {
        Date.timeFormatter.string(from: self)
    }

    var dayMonthString: String {
        Date.dayMonthFormatter.string(from: self)
    }

    var relativeString: String {
        Date.relativeFormatter.localizedString(for: self, relativeTo: Date())
    }

    // MARK: - Date Checks
    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    var isTomorrow: Bool {
        Calendar.current.isDateInTomorrow(self)
    }

    var isYesterday: Bool {
        Calendar.current.isDateInYesterday(self)
    }

    var isPast: Bool {
        self < Date()
    }

    var isFuture: Bool {
        self > Date()
    }

    var isWithinLastWeek: Bool {
        let oneWeekAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        return self >= oneWeekAgo
    }

    // MARK: - Smart Display
    var smartDisplayString: String {
        if isToday {
            return String(localized: "Today at \(timeString)")
        } else if isTomorrow {
            return String(localized: "Tomorrow at \(timeString)")
        } else if isYesterday {
            return String(localized: "Yesterday at \(timeString)")
        } else if isWithinLastWeek {
            let weekdayFormatter = DateFormatter()
            weekdayFormatter.dateFormat = "EEEE"
            return "\(weekdayFormatter.string(from: self)) at \(timeString)"
        } else {
            return displayWithTimeString
        }
    }

    // MARK: - Date Manipulation
    func adding(days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: days, to: self) ?? self
    }

    func adding(hours: Int) -> Date {
        Calendar.current.date(byAdding: .hour, value: hours, to: self) ?? self
    }

    var startOfDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    var endOfDay: Date {
        var components = DateComponents()
        components.day = 1
        components.second = -1
        return Calendar.current.date(byAdding: components, to: startOfDay) ?? self
    }
}

// MARK: - Timestamp Conversion
extension Date {

    init(milliseconds: Int64) {
        self = Date(timeIntervalSince1970: TimeInterval(milliseconds) / 1000)
    }

    var millisecondsSince1970: Int64 {
        Int64((self.timeIntervalSince1970 * 1000).rounded())
    }
}
