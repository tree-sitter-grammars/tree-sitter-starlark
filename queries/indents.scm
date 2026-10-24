[
  (list)
  (dictionary)
  (for_statement)
  (if_statement)
  (parenthesized_expression)
  (dictionary_comprehension)
  (list_comprehension)
  (tuple_pattern)
  (list_pattern)
  (binary_operator)
  (lambda)
  (function_definition)
  (load_statement)
] @indent

(if_statement
  condition: (parenthesized_expression) @aligned_indent
  (#set! "delimiter" "()"))

((ERROR "(" . (_)) @aligned_indent
  (#set! "delimiter" "()"))

((argument_list) @aligned_indent
  (#set! "delimiter" "()"))

((parameters) @aligned_indent
  (#set! "delimiter" "()"))

((tuple) @aligned_indent
  (#set! "delimiter" "()"))

[
  ")"
  "]"
  "}"
  (elif_clause)
  (else_clause)
] @branch

(string) @auto
