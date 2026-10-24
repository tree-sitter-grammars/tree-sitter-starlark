// Generated from src/node-types.json by scripts/generate-node-types.js.
// Do not edit; run `npm run generate:types` after `tree-sitter generate`.
// The .d.ts and .d.cts files are identical: one per module format.

/** Node types that have a name, as reported by `node.type` when `node.isNamed`. */
export type NamedNodeType =
  | "aliased_load"
  | "argument_list"
  | "assignment"
  | "attribute"
  | "augmented_assignment"
  | "binary_operator"
  | "block"
  | "boolean_operator"
  | "break_statement"
  | "call"
  | "comment"
  | "comparison_operator"
  | "conditional_expression"
  | "continue_statement"
  | "default_parameter"
  | "dictionary"
  | "dictionary_comprehension"
  | "dictionary_splat"
  | "dictionary_splat_pattern"
  | "elif_clause"
  | "else_clause"
  | "escape_sequence"
  | "expression_list"
  | "expression_statement"
  | "false"
  | "float"
  | "for_in_clause"
  | "for_statement"
  | "function_definition"
  | "identifier"
  | "if_clause"
  | "if_statement"
  | "integer"
  | "keyword_argument"
  | "keyword_separator"
  | "lambda"
  | "lambda_parameters"
  | "line_continuation"
  | "list"
  | "list_comprehension"
  | "list_pattern"
  | "list_splat"
  | "list_splat_pattern"
  | "load_statement"
  | "module"
  | "none"
  | "not_operator"
  | "pair"
  | "parameters"
  | "parenthesized_expression"
  | "pass_statement"
  | "pattern_list"
  | "return_statement"
  | "slice"
  | "string"
  | "string_content"
  | "string_end"
  | "string_start"
  | "subscript"
  | "true"
  | "tuple"
  | "tuple_pattern"
  | "unary_operator";

/** Anonymous node types: keywords and punctuation. */
export type AnonymousNodeType =
  | "!="
  | "%"
  | "%="
  | "&"
  | "&="
  | "("
  | ")"
  | "*"
  | "**"
  | "*="
  | "+"
  | "+="
  | ","
  | "-"
  | "-="
  | "."
  | "/"
  | "//"
  | "//="
  | "/="
  | ":"
  | ";"
  | "<"
  | "<<"
  | "<<="
  | "<="
  | "="
  | "=="
  | ">"
  | ">="
  | ">>"
  | ">>="
  | "["
  | "\\"
  | "]"
  | "^"
  | "^="
  | "and"
  | "def"
  | "elif"
  | "else"
  | "for"
  | "if"
  | "in"
  | "lambda"
  | "load"
  | "not"
  | "not in"
  | "or"
  | "return"
  | "{"
  | "|"
  | "|="
  | "}"
  | "~";

/** Every value `node.type` can take, apart from `ERROR`. */
export type NodeType = NamedNodeType | AnonymousNodeType;

/** Abstract node types and the concrete types each one stands for. */
export interface Supertypes {
  expression:
    | "boolean_operator"
    | "comparison_operator"
    | "conditional_expression"
    | "lambda"
    | "not_operator"
    | "primary_expression";
  parameter:
    | "default_parameter"
    | "dictionary_splat_pattern"
    | "identifier"
    | "keyword_separator"
    | "list_splat_pattern";
  pattern:
    | "attribute"
    | "identifier"
    | "list_pattern"
    | "list_splat_pattern"
    | "subscript"
    | "tuple_pattern";
  primary_expression:
    | "attribute"
    | "binary_operator"
    | "call"
    | "dictionary"
    | "dictionary_comprehension"
    | "false"
    | "float"
    | "identifier"
    | "integer"
    | "list"
    | "list_comprehension"
    | "none"
    | "parenthesized_expression"
    | "string"
    | "subscript"
    | "true"
    | "tuple"
    | "unary_operator";
}

export type SupertypeNodeType = keyof Supertypes;

/** Information about one kind of child: its possible types and multiplicity. */
export interface ChildInfo<T extends NodeType = NodeType> {
  types: T;
  /** Whether at least one such child is always present. */
  required: boolean;
  /** Whether more than one such child may be present. */
  multiple: boolean;
}

/** The fields of each named node type, by field name. */
export interface NodeFields {
  aliased_load: {
    alias: {
      types: "identifier";
      required: true;
      multiple: false;
    };
    name: {
      types: "string";
      required: true;
      multiple: false;
    };
  };
  argument_list: Record<string, never>;
  assignment: {
    left: {
      types: Supertypes["pattern"] | "pattern_list";
      required: true;
      multiple: false;
    };
    right: {
      types: Supertypes["expression"] | "expression_list";
      required: true;
      multiple: false;
    };
  };
  attribute: {
    attribute: {
      types: "identifier";
      required: true;
      multiple: false;
    };
    object: {
      types: Supertypes["primary_expression"];
      required: true;
      multiple: false;
    };
  };
  augmented_assignment: {
    left: {
      types: Supertypes["pattern"] | "pattern_list";
      required: true;
      multiple: false;
    };
    operator: {
      types: "%=" | "&=" | "*=" | "+=" | "-=" | "//=" | "/=" | "<<=" | ">>=" | "^=" | "|=";
      required: true;
      multiple: false;
    };
    right: {
      types: Supertypes["expression"] | "expression_list";
      required: true;
      multiple: false;
    };
  };
  binary_operator: {
    left: {
      types: Supertypes["primary_expression"];
      required: true;
      multiple: false;
    };
    operator: {
      types: "%" | "&" | "*" | "+" | "-" | "/" | "//" | "<<" | ">>" | "^" | "|";
      required: true;
      multiple: false;
    };
    right: {
      types: Supertypes["primary_expression"];
      required: true;
      multiple: false;
    };
  };
  block: Record<string, never>;
  boolean_operator: {
    left: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
    operator: {
      types: "and" | "or";
      required: true;
      multiple: false;
    };
    right: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
  };
  call: {
    arguments: {
      types: "argument_list";
      required: true;
      multiple: false;
    };
    function: {
      types: Supertypes["primary_expression"];
      required: true;
      multiple: false;
    };
  };
  comparison_operator: {
    left: {
      types: Supertypes["primary_expression"];
      required: true;
      multiple: false;
    };
    operator: {
      types: "!=" | "<" | "<=" | "==" | ">" | ">=" | "in" | "not in";
      required: true;
      multiple: true;
    };
    right: {
      types: Supertypes["primary_expression"];
      required: true;
      multiple: false;
    };
  };
  conditional_expression: Record<string, never>;
  default_parameter: {
    name: {
      types: "identifier";
      required: true;
      multiple: false;
    };
    value: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
  };
  dictionary: Record<string, never>;
  dictionary_comprehension: {
    body: {
      types: "pair";
      required: true;
      multiple: false;
    };
  };
  dictionary_splat: Record<string, never>;
  dictionary_splat_pattern: Record<string, never>;
  elif_clause: {
    condition: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
    consequence: {
      types: "block";
      required: true;
      multiple: false;
    };
  };
  else_clause: {
    body: {
      types: "block";
      required: true;
      multiple: false;
    };
  };
  expression_list: Record<string, never>;
  expression_statement: Record<string, never>;
  for_in_clause: {
    left: {
      types: Supertypes["pattern"] | "pattern_list";
      required: true;
      multiple: false;
    };
    right: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
  };
  for_statement: {
    body: {
      types: "block";
      required: true;
      multiple: false;
    };
    left: {
      types: Supertypes["pattern"] | "pattern_list";
      required: true;
      multiple: false;
    };
    right: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
  };
  function_definition: {
    body: {
      types: "block";
      required: true;
      multiple: false;
    };
    name: {
      types: "identifier";
      required: true;
      multiple: false;
    };
    parameters: {
      types: "parameters";
      required: true;
      multiple: false;
    };
  };
  if_clause: Record<string, never>;
  if_statement: {
    alternative: {
      types: "elif_clause" | "else_clause";
      required: false;
      multiple: true;
    };
    condition: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
    consequence: {
      types: "block";
      required: true;
      multiple: false;
    };
  };
  keyword_argument: {
    name: {
      types: "identifier";
      required: true;
      multiple: false;
    };
    value: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
  };
  keyword_separator: Record<string, never>;
  lambda: {
    body: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
    parameters: {
      types: "lambda_parameters";
      required: false;
      multiple: false;
    };
  };
  lambda_parameters: Record<string, never>;
  list: Record<string, never>;
  list_comprehension: {
    body: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
  };
  list_pattern: Record<string, never>;
  list_splat: Record<string, never>;
  list_splat_pattern: Record<string, never>;
  load_statement: {
    module: {
      types: "string";
      required: true;
      multiple: false;
    };
  };
  module: Record<string, never>;
  not_operator: {
    argument: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
  };
  pair: {
    key: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
    value: {
      types: Supertypes["expression"];
      required: true;
      multiple: false;
    };
  };
  parameters: Record<string, never>;
  parenthesized_expression: Record<string, never>;
  pattern_list: Record<string, never>;
  return_statement: Record<string, never>;
  slice: Record<string, never>;
  string: Record<string, never>;
  string_content: Record<string, never>;
  subscript: {
    subscript: {
      types: Supertypes["expression"] | "slice";
      required: true;
      multiple: true;
    };
    value: {
      types: Supertypes["primary_expression"];
      required: true;
      multiple: false;
    };
  };
  tuple: Record<string, never>;
  tuple_pattern: Record<string, never>;
  unary_operator: {
    argument: {
      types: Supertypes["primary_expression"];
      required: true;
      multiple: false;
    };
    operator: {
      types: "+" | "-" | "~";
      required: true;
      multiple: false;
    };
  };
  break_statement: Record<string, never>;
  comment: Record<string, never>;
  continue_statement: Record<string, never>;
  escape_sequence: Record<string, never>;
  false: Record<string, never>;
  float: Record<string, never>;
  identifier: Record<string, never>;
  integer: Record<string, never>;
  line_continuation: Record<string, never>;
  none: Record<string, never>;
  pass_statement: Record<string, never>;
  string_end: Record<string, never>;
  string_start: Record<string, never>;
  true: Record<string, never>;
}

/** The named children of each node type that are not under a field. */
export interface NodeChildren {
  aliased_load: never;
  argument_list: {
    types: "dictionary_splat" | Supertypes["expression"] | "keyword_argument" | "list_splat";
    required: false;
    multiple: true;
  };
  assignment: never;
  attribute: never;
  augmented_assignment: never;
  binary_operator: never;
  block: {
    types: "break_statement" | "continue_statement" | "expression_statement" | "for_statement" | "function_definition" | "if_statement" | "load_statement" | "pass_statement" | "return_statement";
    required: false;
    multiple: true;
  };
  boolean_operator: never;
  call: never;
  comparison_operator: never;
  conditional_expression: {
    types: Supertypes["expression"];
    required: true;
    multiple: true;
  };
  default_parameter: never;
  dictionary: {
    types: "pair";
    required: false;
    multiple: true;
  };
  dictionary_comprehension: {
    types: "for_in_clause" | "if_clause";
    required: true;
    multiple: true;
  };
  dictionary_splat: {
    types: Supertypes["expression"];
    required: true;
    multiple: false;
  };
  dictionary_splat_pattern: {
    types: "attribute" | "identifier" | "subscript";
    required: true;
    multiple: false;
  };
  elif_clause: never;
  else_clause: never;
  expression_list: {
    types: Supertypes["expression"];
    required: true;
    multiple: true;
  };
  expression_statement: {
    types: "assignment" | "augmented_assignment" | Supertypes["expression"];
    required: true;
    multiple: false;
  };
  for_in_clause: never;
  for_statement: never;
  function_definition: never;
  if_clause: {
    types: Supertypes["expression"];
    required: true;
    multiple: false;
  };
  if_statement: never;
  keyword_argument: never;
  keyword_separator: never;
  lambda: never;
  lambda_parameters: {
    types: Supertypes["parameter"];
    required: true;
    multiple: true;
  };
  list: {
    types: Supertypes["expression"];
    required: false;
    multiple: true;
  };
  list_comprehension: {
    types: "for_in_clause" | "if_clause";
    required: true;
    multiple: true;
  };
  list_pattern: {
    types: Supertypes["pattern"];
    required: false;
    multiple: true;
  };
  list_splat: {
    types: Supertypes["expression"];
    required: true;
    multiple: false;
  };
  list_splat_pattern: {
    types: "attribute" | "identifier" | "subscript";
    required: true;
    multiple: false;
  };
  load_statement: {
    types: "aliased_load" | "string";
    required: false;
    multiple: true;
  };
  module: {
    types: "break_statement" | "continue_statement" | "expression_statement" | "for_statement" | "function_definition" | "if_statement" | "load_statement" | "pass_statement" | "return_statement";
    required: false;
    multiple: true;
  };
  not_operator: never;
  pair: never;
  parameters: {
    types: Supertypes["parameter"];
    required: false;
    multiple: true;
  };
  parenthesized_expression: {
    types: Supertypes["expression"];
    required: true;
    multiple: false;
  };
  pattern_list: {
    types: Supertypes["pattern"];
    required: true;
    multiple: true;
  };
  return_statement: {
    types: Supertypes["expression"] | "expression_list";
    required: false;
    multiple: false;
  };
  slice: {
    types: Supertypes["expression"];
    required: false;
    multiple: true;
  };
  string: {
    types: "string_content" | "string_end" | "string_start";
    required: true;
    multiple: true;
  };
  string_content: {
    types: "escape_sequence";
    required: false;
    multiple: true;
  };
  subscript: never;
  tuple: {
    types: Supertypes["expression"];
    required: false;
    multiple: true;
  };
  tuple_pattern: {
    types: Supertypes["pattern"];
    required: false;
    multiple: true;
  };
  unary_operator: never;
  break_statement: never;
  comment: never;
  continue_statement: never;
  escape_sequence: never;
  false: never;
  float: never;
  identifier: never;
  integer: never;
  line_continuation: never;
  none: never;
  pass_statement: never;
  string_end: never;
  string_start: never;
  true: never;
}

/** The field names a node type has. */
export type FieldName<T extends NamedNodeType> = keyof NodeFields[T] & string;

/** The types a field of a node type can hold. */
export type FieldType<T extends NamedNodeType, F extends FieldName<T>> =
  NodeFields[T][F] extends { types: infer U extends NodeType } ? U : never;

/**
 * The shape every tree-sitter runtime gives a syntax node, narrowed by type.
 * Use it to type-check code that inspects `node.type`:
 *
 * @example
 * function isNode<T extends NodeType>(node: { type: string }, type: T): node is TypedNode<T> {
 *   return node.type === type;
 * }
 */
export interface TypedNode<T extends NodeType = NodeType> {
  readonly type: T;
}
