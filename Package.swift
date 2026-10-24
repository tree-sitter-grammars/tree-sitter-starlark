// swift-tools-version:5.6
import PackageDescription

let package = Package(
    name: "TreeSitterStarlark",
    products: [
        .library(name: "TreeSitterStarlark", targets: ["TreeSitterStarlark"]),
    ],
    dependencies: [
        .package(url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.25.0"),
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
                .product(name: "SwiftTreeSitter", package: "swift-tree-sitter"),
                "TreeSitterStarlark",
            ],
            path: "bindings/swift/TreeSitterStarlarkTests"
        )
    ],
    cLanguageStandard: .c11
)
