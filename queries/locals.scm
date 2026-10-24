;;; Program structure

(module) @scope

;;; Loads define names

(load_statement
  (string) @definition.import)

(aliased_load
  alias: (identifier) @definition.import)

;;; Functions define parameters, a function and a scope

(parameters
  (identifier) @definition.parameter)

(default_parameter
  name: (identifier) @definition.parameter)

(parameters
  (list_splat_pattern
    (identifier) @definition.parameter))

(parameters
  (dictionary_splat_pattern
    (identifier) @definition.parameter))

((function_definition
  name: (identifier) @definition.function) @scope
  (#set! definition.function.scope "parent"))

(lambda_parameters
  (identifier) @definition.parameter)

(lambda) @scope

;;; Loops (not a scope in Starlark)

(for_statement
  left: (identifier) @definition.var)

(for_statement
  left: (pattern_list
    (identifier) @definition.var))

(for_statement
  left: (tuple_pattern
    (identifier) @definition.var))

(for_in_clause
  left: (identifier) @definition.var)

(for_in_clause
  left: (pattern_list
    (identifier) @definition.var))

(for_in_clause
  left: (tuple_pattern
    (identifier) @definition.var))

(list_comprehension) @scope

(dictionary_comprehension) @scope

;;; Assignments

(assignment
  left: (identifier) @definition.var)

(assignment
  left: (pattern_list
    (identifier) @definition.var))

(assignment
  left: (tuple_pattern
    (identifier) @definition.var))

(assignment
  left: (attribute
    (identifier)
    (identifier) @definition.field))

;;; References

(identifier) @reference
