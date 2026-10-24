import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import type { Node } from "web-tree-sitter";
import type { Supertypes } from "tree-sitter-starlark/node-types";
import { createParser, field, isNode, StarlarkNode } from "./starlark";

const EXAMPLES = join(__dirname, "..", "..", "..", "examples");

test("parses a load statement and calls with typed field access", async () => {
  const parser = await createParser();
  const tree = parser.parse(
    'load("//pkg:defs.bzl", "my_rule", renamed = "other")\nmy_rule(name = "x")\nnative.cc_library(name = "y")\n',
  );
  assert.ok(tree);
  assert.equal(tree.rootNode.hasError, false);
  const [load, first, second] = tree.rootNode.namedChildren;
  assert.ok(isNode(load, "load_statement"));
  assert.equal(field(load, "module")?.text, '"//pkg:defs.bzl"');
  const alias = load.namedChildren.find((n): n is StarlarkNode<"aliased_load"> => isNode(n, "aliased_load"));
  assert.equal(field(alias!, "alias")?.text, "renamed");
  for (const [statement, callee, kind] of [
    [first, "my_rule", "identifier"],
    [second, "native.cc_library", "attribute"],
  ] as const) {
    assert.ok(isNode(statement, "expression_statement"));
    const call = statement.firstNamedChild;
    assert.ok(call && isNode(call, "call"));
    const fn = field(call, "function");
    const fnKind: Supertypes["primary_expression"] | undefined = fn?.type;
    assert.equal(fn?.text, callee);
    assert.equal(fnKind, kind);
    assert.equal(field(call, "arguments")?.namedChildren.length, 1);
  }
});

test("rejects Python-only syntax and recovers around errors", async () => {
  const parser = await createParser();
  for (const source of ["while True:\n    pass\n", "x: int = 1\n", "a ** b\n", "a < b < c\n"]) {
    assert.equal(parser.parse(source)?.rootNode.hasError, true, source);
  }
  const tree = parser.parse('cc_library(\n    name = "a",\n    srcs = ["a.cc",\n)\n\ncc_library(\n    name = "b",\n)\n');
  const calls = tree!.rootNode.namedChildren.filter((n: Node) => isNode(n, "expression_statement"));
  assert.equal(calls.length, 2, "both rules survive the unclosed list");
});

test("parses every example without errors", async () => {
  const parser = await createParser();
  for (const name of readdirSync(EXAMPLES).filter((n) => n.endsWith(".bzl"))) {
    const tree = parser.parse(readFileSync(join(EXAMPLES, name), "utf8"));
    assert.equal(tree?.rootNode.hasError, false, name);
  }
});

// Mistakes the typings must catch at compile time.
// @ts-expect-error `call` has no field `module`
export const wrongField = (n: StarlarkNode<"call">) => field(n, "module");
// @ts-expect-error not a node type in this grammar
export const wrongType = (n: Node) => isNode(n, "class_definition");
