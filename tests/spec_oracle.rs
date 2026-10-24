//! Differential test against the reference implementation.
//!
//! `starlark_syntax` (the parser of starlark-rust) implements the Starlark
//! spec, including rules a grammar cannot express. Every program in the
//! test corpus and in `examples/` must be accepted by both parsers, or
//! rejected by both; a disagreement is a bug in this grammar.
//!
//! Cases whose title ends in "(reference parser differs)" are skipped: the
//! reference deviates from the spec there (it rejects non-ASCII identifiers,
//! which the spec allows) and the grammar follows the spec.
//!
//! Set `SPEC_ORACLE_PATHS` to a newline-separated list of files to run the
//! comparison over an external corpus as well.

use std::fs;
use std::path::Path;

use starlark_syntax::syntax::{AstModule, Dialect, DialectTypes};
use tree_sitter::Parser;

/// The dialect the grammar follows: the spec, with no implementation
/// extensions (types, f-strings) and no restrictions beyond it.
fn dialect() -> Dialect {
    let mut dialect = Dialect::Standard;
    dialect.enable_def = true;
    dialect.enable_lambda = true;
    dialect.enable_load = true;
    dialect.enable_keyword_only_arguments = true;
    dialect.enable_top_level_stmt = true;
    dialect.enable_types = DialectTypes::Disable;
    dialect.enable_f_strings = false;
    dialect
}

fn reference_accepts(source: &str) -> Result<(), String> {
    AstModule::parse("test.bzl", source.to_owned(), &dialect())
        .map(|_| ())
        .map_err(|e| e.to_string().lines().next().unwrap_or("").to_owned())
}

fn grammar_accepts(parser: &mut Parser, source: &str) -> bool {
    let tree = parser.parse(source, None).expect("parse");
    !tree.root_node().has_error()
}

fn parser() -> Parser {
    let mut parser = Parser::new();
    parser
        .set_language(&tree_sitter_starlark::LANGUAGE.into())
        .expect("Error loading Starlark parser");
    parser
}

/// One test of a `test/corpus/*.txt` file: its title and input.
struct CorpusCase {
    title: String,
    input: String,
    expects_error: bool,
}

/// Reads the corpus format: a title between lines of `=`, optional
/// `:attribute` lines, the input, then a line of `-` before the expected
/// tree.
fn corpus_cases(path: &Path) -> Vec<CorpusCase> {
    let text = fs::read_to_string(path).expect("read corpus file");
    let mut cases = Vec::new();
    let mut lines = text.lines().peekable();
    while let Some(line) = lines.next() {
        if !is_rule(line, '=') {
            continue;
        }
        let title = lines.next().unwrap_or("").to_owned();
        let mut expects_error = false;
        while let Some(line) = lines.next() {
            if is_rule(line, '=') {
                break;
            }
            if line.trim() == ":error" {
                expects_error = true;
            }
        }
        let mut input = String::new();
        for line in lines.by_ref() {
            if is_rule(line, '-') {
                break;
            }
            input.push_str(line);
            input.push('\n');
        }
        cases.push(CorpusCase {
            title,
            input,
            expects_error,
        });
    }
    cases
}

fn is_rule(line: &str, ch: char) -> bool {
    line.len() >= 3 && line.chars().all(|c| c == ch)
}

fn repo_path(relative: &str) -> std::path::PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join(relative)
}

#[test]
fn corpus_agrees_with_reference_parser() {
    let mut parser = parser();
    let mut failures = Vec::new();
    let corpus = repo_path("test/corpus");
    let mut files: Vec<_> = fs::read_dir(&corpus)
        .expect("test/corpus")
        .map(|e| e.expect("entry").path())
        .collect();
    files.sort();
    for file in files {
        for case in corpus_cases(&file) {
            if case.title.ends_with("(reference parser differs)") {
                continue;
            }
            let reference = reference_accepts(&case.input);
            let grammar = grammar_accepts(&mut parser, &case.input);
            let name = format!("{}: {}", file.file_name().unwrap().to_string_lossy(), case.title);
            if case.expects_error {
                if let Ok(()) = reference {
                    failures.push(format!("{name}: the reference parser accepts an :error case"));
                }
                if grammar {
                    failures.push(format!("{name}: the grammar accepts an :error case"));
                }
            } else {
                if let Err(message) = reference {
                    failures.push(format!("{name}: the reference parser rejects it: {message}"));
                }
                if !grammar {
                    failures.push(format!("{name}: the grammar rejects it"));
                }
            }
        }
    }
    assert!(failures.is_empty(), "\n{}", failures.join("\n"));
}

#[test]
fn examples_agree_with_reference_parser() {
    let mut parser = parser();
    let mut files: Vec<std::path::PathBuf> = fs::read_dir(repo_path("examples"))
        .expect("examples")
        .map(|e| e.expect("entry").path())
        .filter(|p| p.extension().map_or(false, |e| e == "bzl"))
        .collect();
    if let Ok(extra) = std::env::var("SPEC_ORACLE_PATHS") {
        files.extend(extra.lines().filter(|l| !l.is_empty()).map(Into::into));
    }
    files.sort();
    let mut failures = Vec::new();
    for file in files {
        let Ok(source) = fs::read_to_string(&file) else {
            continue;
        };
        let reference = reference_accepts(&source).is_ok();
        let grammar = grammar_accepts(&mut parser, &source);
        if reference != grammar {
            failures.push(format!(
                "{}: reference {} but grammar {}",
                file.display(),
                if reference { "accepts" } else { "rejects" },
                if grammar { "accepts" } else { "rejects" },
            ));
        }
    }
    assert!(failures.is_empty(), "\n{}", failures.join("\n"));
}
