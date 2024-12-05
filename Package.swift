// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterStarlark",
    products: [
        .library(name: "TreeSitterStarlark", targets: ["TreeSitterStarlark"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterStarlark",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                "src/scanner.c",
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterStarlarkTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterStarlark",
            ],
            path: "bindings/swift/TreeSitterStarlarkTests"
        )
    ],
    cLanguageStandard: .c11
)
