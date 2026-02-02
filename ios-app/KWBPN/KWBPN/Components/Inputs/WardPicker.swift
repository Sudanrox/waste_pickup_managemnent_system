//
//  WardPicker.swift
//  KWBPN
//
//  Ward selection picker component
//

import SwiftUI

struct WardPicker: View {

    // MARK: - Properties
    @Binding var selectedWard: Int?
    var label: String = "Select Your Ward"
    var isDisabled: Bool = false
    @State private var showPicker = false

    // MARK: - Body
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Label
            Text(label)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.secondary)

            // Picker Button
            Button {
                showPicker = true
            } label: {
                HStack {
                    if let ward = selectedWard {
                        Label("Ward \(ward)", systemImage: "mappin.circle.fill")
                            .font(.body)
                            .fontWeight(.medium)
                            .foregroundColor(.primary)
                    } else {
                        Label("Tap to select ward", systemImage: "mappin.circle")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    Image(systemName: "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(Color.secondaryBackground)
                .cornerRadius(Constants.UI.cornerRadius)
            }
            .disabled(isDisabled)
        }
        .sheet(isPresented: $showPicker) {
            WardPickerSheet(selectedWard: $selectedWard)
        }
    }
}

// MARK: - Ward Picker Sheet
struct WardPickerSheet: View {

    // MARK: - Properties
    @Binding var selectedWard: Int?
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""

    // MARK: - Computed Properties
    private var filteredWards: [Int] {
        let allWards = Array(1...Constants.Validation.totalWards)
        if searchText.isEmpty {
            return allWards
        }
        return allWards.filter { "\($0)".contains(searchText) }
    }

    // MARK: - Body
    var body: some View {
        NavigationStack {
            List {
                ForEach(filteredWards, id: \.self) { ward in
                    WardRow(
                        wardNumber: ward,
                        isSelected: selectedWard == ward
                    ) {
                        selectedWard = ward
                        dismiss()
                    }
                }
            }
            .listStyle(.plain)
            .searchable(text: $searchText, prompt: "Search ward number")
            .navigationTitle("Select Ward")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Ward Row
struct WardRow: View {
    let wardNumber: Int
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Ward \(wardNumber)")
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)

                    Text("वडा \(wardNumber.nepaliNumeral)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundColor(.accentColor)
                }
            }
            .padding(.vertical, 4)
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 24) {
        WardPicker(selectedWard: .constant(nil))

        WardPicker(selectedWard: .constant(5))

        Divider()

        WardPickerSheet(selectedWard: .constant(5))
    }
    .padding()
}
