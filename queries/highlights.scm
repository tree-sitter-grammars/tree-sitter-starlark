;; Identifiers

(identifier) @variable

((identifier) @constant
  (#match? @constant "^[A-Z][A-Z_0-9]*$"))

(attribute
  attribute: (identifier) @field)

;; Parameters and keyword arguments

(parameters
  (identifier) @parameter)

(lambda_parameters
  (identifier) @parameter)

(default_parameter
  name: (identifier) @parameter)

(list_splat_pattern
  (identifier) @parameter)

(dictionary_splat_pattern
  (identifier) @parameter)

(keyword_argument
  name: (identifier) @parameter)

;; Literals

(none) @constant.builtin

[
  (true)
  (false)
] @boolean

(integer) @number

(float) @float

(comment) @comment @spell

(string) @string

(escape_sequence) @string.escape

; Docstrings
(expression_statement
  (string) @spell)

;; Function definitions and calls

(function_definition
  name: (identifier) @function)

(call
  function: (identifier) @function.call)

(call
  function: (attribute
    attribute: (identifier) @method.call))

((call
  function: (identifier) @constructor)
  (#match? @constructor "^[A-Z]"))

((call
  function: (attribute
    attribute: (identifier) @constructor))
  (#match? @constructor "^[A-Z]"))

;; Functions available in every Starlark file (the universe) and the ones
;; Bazel adds to BUILD, .bzl and MODULE.bazel files.
((call
  function: (identifier) @function.builtin)
  (#any-of? @function.builtin
    "abs" "all" "any" "bool" "dict" "dir" "enumerate" "fail" "float" "getattr"
    "hasattr" "hash" "int" "len" "list" "max" "min" "print" "range" "repr"
    "reversed" "sorted" "str" "tuple" "type" "zip"
    "Label" "aspect" "configuration_field" "depset" "exec_group"
    "exports_files" "glob" "licenses" "macro" "module_extension" "package"
    "package_group" "provider" "register_execution_platforms"
    "register_toolchains" "repository_rule" "rule" "select" "struct"
    "subrule" "tag_class" "visibility" "workspace"
    "archive_override" "bazel_dep" "git_override" "include" "inject_repo"
    "local_path_override" "module" "multiple_version_override"
    "override_repo" "single_version_override" "use_extension" "use_repo"
    "use_repo_rule"))

((identifier) @variable.builtin
  (#any-of? @variable.builtin "attr" "native" "json" "proto" "testing"))

;; Loads

(load_statement
  "load" @include)

(load_statement
  module: (string) @string.special)

(aliased_load
  alias: (identifier) @variable)

;; Operators

[
  "-"
  "-="
  "!="
  "*"
  "*="
  "/"
  "//"
  "//="
  "/="
  "&"
  "&="
  "%"
  "%="
  "^"
  "^="
  "+"
  "+="
  "<"
  "<<"
  "<<="
  "<="
  "="
  "=="
  ">"
  ">="
  ">>"
  ">>="
  "|"
  "|="
  "~"
] @operator

;; Keywords

[
  "and"
  "in"
  "not"
  "or"
] @keyword.operator

[
  "def"
  "lambda"
] @keyword.function

(pass_statement) @keyword

"return" @keyword.return

[
  "if"
  "elif"
  "else"
] @conditional

"for" @repeat

[
  (break_statement)
  (continue_statement)
] @repeat

;; Punctuation

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  "."
  ":"
  ";"
] @punctuation.delimiter

;; Errors

(ERROR) @error
