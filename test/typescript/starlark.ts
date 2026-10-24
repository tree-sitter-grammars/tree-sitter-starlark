// The way an editor extension consumes this package: runtime from
// web-tree-sitter, node types from `tree-sitter-starlark/node-types`.
import { Language, Node, Parser } from "web-tree-sitter";
import type {
  FieldName,
  FieldType,
  NamedNodeType,
  NodeType,
  TypedNode,
} from "tree-sitter-starlark/node-types";

/** A web-tree-sitter node whose type is known. */
export type StarlarkNode<T extends NodeType = NodeType> = Node & TypedNode<T>;

export function isNode<T extends NodeType>(node: Node, type: T): node is StarlarkNode<T> {
  return node.type === type;
}

/** `childForFieldName`, typed by the grammar's field table. */
export function field<T extends NamedNodeType, F extends FieldName<T>>(
  node: StarlarkNode<T>,
  name: F,
): StarlarkNode<FieldType<T, F>> | null {
  return node.childForFieldName(name) as StarlarkNode<FieldType<T, F>> | null;
}

export async function createParser(): Promise<Parser> {
  await Parser.init();
  const parser = new Parser();
  const wasm = require.resolve("tree-sitter-starlark/tree-sitter-starlark.wasm");
  parser.setLanguage(await Language.load(wasm));
  return parser;
}
