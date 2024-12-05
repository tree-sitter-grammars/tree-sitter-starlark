import XCTest
import SwiftTreeSitter
import TreeSitterStarlark

final class TreeSitterStarlarkTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_starlark())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Starlark grammar")
    }
}
