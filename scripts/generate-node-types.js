#!/usr/bin/env node
// Generates bindings/node/node-types.d.ts (and an identical .d.cts, so that
// CommonJS consumers under node16 resolution get the types too) from
// src/node-types.json: string literal types for every node type, the fields
// and children of each named node, and the members of each supertype. Run
// after `tree-sitter generate`.

import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const nodeTypes = JSON.parse(readFileSync(`${root}/src/node-types.json`, 'utf8'));

const literal = (name) => JSON.stringify(name);
const union = (names) => (names.length ? names.map(literal).join(' | ') : 'never');
const identifier = (name) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : literal(name));

const supertypes = nodeTypes.filter((t) => t.subtypes);
const supertypeNames = new Set(supertypes.map((t) => t.type));
const named = nodeTypes.filter((t) => t.named && !t.subtypes).map((t) => t.type).sort();
const anonymous = nodeTypes.filter((t) => !t.named).map((t) => t.type).sort();

/**
 * The TypeScript type of a set of child types, naming supertypes by their alias.
 *
 * @param {{type: string, named: boolean}[]} types
 */
function childTypes(types) {
  const parts = types.map((t) => (supertypeNames.has(t.type) ? `Supertypes[${literal(t.type)}]` : literal(t.type)));
  return parts.length ? [...new Set(parts)].join(' | ') : 'never';
}

const lines = [];
lines.push('// Generated from src/node-types.json by scripts/generate-node-types.js.');
lines.push('// Do not edit; run `npm run generate:types` after `tree-sitter generate`.');
lines.push('// The .d.ts and .d.cts files are identical: one per module format.');
lines.push('');
lines.push('/** Node types that have a name, as reported by `node.type` when `node.isNamed`. */');
lines.push(`export type NamedNodeType =\n  | ${union(named).replaceAll(' | ', '\n  | ')};`);
lines.push('');
lines.push('/** Anonymous node types: keywords and punctuation. */');
lines.push(`export type AnonymousNodeType =\n  | ${union(anonymous).replaceAll(' | ', '\n  | ')};`);
lines.push('');
lines.push('/** Every value `node.type` can take, apart from `ERROR`. */');
lines.push('export type NodeType = NamedNodeType | AnonymousNodeType;');
lines.push('');
lines.push('/** Abstract node types and the concrete types each one stands for. */');
lines.push('export interface Supertypes {');
for (const t of supertypes) {
  lines.push(`  ${identifier(t.type)}:\n    | ${union(t.subtypes.map((s) => s.type)).replaceAll(' | ', '\n    | ')};`);
}
lines.push('}');
lines.push('');
lines.push('export type SupertypeNodeType = keyof Supertypes;');
lines.push('');
lines.push('/** Information about one kind of child: its possible types and multiplicity. */');
lines.push('export interface ChildInfo<T extends NodeType = NodeType> {');
lines.push('  types: T;');
lines.push('  /** Whether at least one such child is always present. */');
lines.push('  required: boolean;');
lines.push('  /** Whether more than one such child may be present. */');
lines.push('  multiple: boolean;');
lines.push('}');
lines.push('');
lines.push('/** The fields of each named node type, by field name. */');
lines.push('export interface NodeFields {');
for (const t of nodeTypes.filter((n) => n.named && !n.subtypes)) {
  const fields = Object.entries(t.fields ?? {});
  if (!fields.length) {
    lines.push(`  ${identifier(t.type)}: Record<string, never>;`);
    continue;
  }
  lines.push(`  ${identifier(t.type)}: {`);
  for (const [name, info] of fields) {
    lines.push(`    ${identifier(name)}: {`);
    lines.push(`      types: ${childTypes(info.types)};`);
    lines.push(`      required: ${info.required};`);
    lines.push(`      multiple: ${info.multiple};`);
    lines.push('    };');
  }
  lines.push('  };');
}
lines.push('}');
lines.push('');
lines.push('/** The named children of each node type that are not under a field. */');
lines.push('export interface NodeChildren {');
for (const t of nodeTypes.filter((n) => n.named && !n.subtypes)) {
  if (!t.children) {
    lines.push(`  ${identifier(t.type)}: never;`);
    continue;
  }
  lines.push(`  ${identifier(t.type)}: {`);
  lines.push(`    types: ${childTypes(t.children.types)};`);
  lines.push(`    required: ${t.children.required};`);
  lines.push(`    multiple: ${t.children.multiple};`);
  lines.push('  };');
}
lines.push('}');
lines.push('');
lines.push('/** The field names a node type has. */');
lines.push('export type FieldName<T extends NamedNodeType> = keyof NodeFields[T] & string;');
lines.push('');
lines.push('/** The types a field of a node type can hold. */');
lines.push('export type FieldType<T extends NamedNodeType, F extends FieldName<T>> =');
lines.push('  NodeFields[T][F] extends { types: infer U extends NodeType } ? U : never;');
lines.push('');
lines.push('/**');
lines.push(' * The shape every tree-sitter runtime gives a syntax node, narrowed by type.');
lines.push(' * Use it to type-check code that inspects `node.type`:');
lines.push(' *');
lines.push(' * @example');
lines.push(' * function isNode<T extends NodeType>(node: { type: string }, type: T): node is TypedNode<T> {');
lines.push(' *   return node.type === type;');
lines.push(' * }');
lines.push(' */');
lines.push('export interface TypedNode<T extends NodeType = NodeType> {');
lines.push('  readonly type: T;');
lines.push('}');
lines.push('');
for (const file of ['node-types.d.ts', 'node-types.d.cts']) {
  writeFileSync(`${root}/bindings/node/${file}`, lines.join('\n'));
}
console.log(`Wrote ${named.length} named and ${anonymous.length} anonymous node types to bindings/node/node-types.d.{ts,cts}`);
