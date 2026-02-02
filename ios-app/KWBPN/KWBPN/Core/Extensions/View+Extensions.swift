//
//  View+Extensions.swift
//  KWBPN
//
//  SwiftUI View extensions and modifiers
//

import SwiftUI

// MARK: - View Extensions
extension View {

    // MARK: - Conditional Modifier
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }

    @ViewBuilder
    func ifLet<Value, Content: View>(_ value: Value?, transform: (Self, Value) -> Content) -> some View {
        if let value = value {
            transform(self, value)
        } else {
            self
        }
    }

    // MARK: - Card Style
    func cardStyle(padding: CGFloat = Constants.UI.cardPadding) -> some View {
        self
            .padding(padding)
            .background(Color.cardBackground)
            .cornerRadius(Constants.UI.cornerRadius)
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
    }

    // MARK: - Loading Overlay
    func loadingOverlay(_ isLoading: Bool) -> some View {
        self.overlay {
            if isLoading {
                ZStack {
                    Color.black.opacity(0.3)
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(1.2)
                }
                .ignoresSafeArea()
            }
        }
    }

    // MARK: - Hide Keyboard
    func hideKeyboard() {
        UIApplication.shared.sendAction(
            #selector(UIResponder.resignFirstResponder),
            to: nil,
            from: nil,
            for: nil
        )
    }

    func onTapToDismissKeyboard() -> some View {
        self.onTapGesture {
            hideKeyboard()
        }
    }

    // MARK: - Corner Radius for Specific Corners
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }

    // MARK: - Shake Animation
    func shake(_ shake: Bool) -> some View {
        self.modifier(ShakeModifier(shake: shake))
    }

    // MARK: - Error Border
    func errorBorder(_ showError: Bool) -> some View {
        self.overlay(
            RoundedRectangle(cornerRadius: Constants.UI.cornerRadius)
                .stroke(showError ? Color.error : Color.clear, lineWidth: 2)
        )
    }
}

// MARK: - Rounded Corner Shape
struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

// MARK: - Shake Modifier
struct ShakeModifier: ViewModifier {
    let shake: Bool

    func body(content: Content) -> some View {
        content
            .offset(x: shake ? -5 : 0)
            .animation(
                shake ?
                    Animation.easeInOut(duration: 0.1).repeatCount(3, autoreverses: true) :
                    .default,
                value: shake
            )
    }
}

// MARK: - First Appear Modifier
struct FirstAppearModifier: ViewModifier {
    @State private var hasAppeared = false
    let action: () -> Void

    func body(content: Content) -> some View {
        content.onAppear {
            guard !hasAppeared else { return }
            hasAppeared = true
            action()
        }
    }
}

extension View {
    func onFirstAppear(perform action: @escaping () -> Void) -> some View {
        modifier(FirstAppearModifier(action: action))
    }
}

// MARK: - Async Button Style
struct AsyncButtonStyle: ButtonStyle {
    let isLoading: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(isLoading ? 0.5 : (configuration.isPressed ? 0.7 : 1.0))
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}
