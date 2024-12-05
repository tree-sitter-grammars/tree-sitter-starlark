/**
 * @file Starlark grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 * @see {@link https://github.com/bazelbuild/starlark|official website}
 * @see {@link https://github.com/bazelbuild/starlark/blob/master/spec.md|official syntax spec}
 * @see {@link https://bazel.build/rules/language|official language guide}
 */


/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const Python = require('tree-sitter-python/grammar');

module.exports = grammar(Python, {
  name: 'starlark',

  conflicts: (_, original) => original.filter((e) =>
    !(e.length == 2 && e[0].name == 'match_statement' && e[1].name == 'primary_expression'),
  ),

  rules: {
    assert_statement: $ => seq(
      choice(
        seq(
          alias('assert', $.assert_keyword),
          optional(seq('.', alias(choice('eq', 'ne', 'contains', 'fails'), $.assert_builtin))),
        ),
        alias(
          choice(
            'assert_',
            'assert_eq',
            'assert_ne',
            'assert_contains',
            'assert_fails',
          ),
          $.assert_keyword,
        ),
      ),
      commaSep1($.expression),
    ),

    // Starlark has no yield statements
    expression_statement: $ => choice(
      $.expression,
      seq(commaSep1($.expression), optional(',')),
      $.assignment,
      $.augmented_assignment,
    ),

    // Starlark has no globals, no imports, no nonlocals, and no exceptions
    //
    // So: no global, import, nonlocal, and raise statements
    _simple_statement: $ => choice(
      $.print_statement,
      $.assert_statement,
      $.expression_statement,
      $.return_statement,
      $.delete_statement,
      $.pass_statement,
      $.break_statement,
      $.continue_statement,
      $.exec_statement,
    ),

    // Starlark has no exceptions and no classes
    // Google's implementation of Starlark supports while statements
    //
    // So: no try statements and as a result no finally clauses,
    // as well as no class definitions (structs instead)
    _compound_statement: $ => choice(
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.with_statement,
      $.function_definition,
      $.decorated_definition,
      $.match_statement,
    ),

    // Remove class definitions from decorated definitions
    decorated_definition: $ => seq(
      repeat1($.decorator),
      field('definition', $.function_definition),
    ),

    // Starlark has no concatenated string expressions and no generators
    // Google's implementation of Starlark optionally supports sets
    primary_expression: $ => choice(
      $.binary_operator,
      $.identifier,
      $.keyword_identifier,
      $.string,
      $.integer,
      $.float,
      $.true,
      $.false,
      $.none,
      $.unary_operator,
      $.attribute,
      $.subscript,
      $.call,
      $.list,
      $.list_comprehension,
      $.dictionary,
      $.dictionary_comprehension,
      $.set,
      $.set_comprehension,
      $.tuple,
      $.parenthesized_expression,
      $.ellipsis,
      alias($.list_splat_pattern, $.list_splat),
    ),

    // Starlark has no `is` operator
    comparison_operator: $ => prec.left(Python.PREC.compare, seq(
      $.primary_expression,
      repeat1(seq(
        field('operators',
          choice(
            '<',
            '<=',
            '==',
            '!=',
            '>=',
            '>',
            '<>',
            'in',
            alias(seq('not', 'in'), 'not in'),
          )),
        $.primary_expression,
      )),
    )),

    // Starlark has no generator expressions
    call: $ => prec(Python.PREC.call, seq(
      field('function', $.primary_expression),
      field('arguments', $.argument_list),
    )),


    // Starlark has no yield statements
    _right_hand_side: $ => choice(
      $.expression,
      $.expression_list,
      $.assignment,
      $.augmented_assignment,
      $.pattern_list,
    ),

    // Starlark has no yield statements
    parenthesized_expression: $ => prec(Python.PREC.parenthesized_expression, seq(
      '(',
      $.expression,
      ')',
    )),

    // Starlark has no yield statements
    _collection_elements: $ => seq(
      commaSep1(choice(
        $.expression, $.list_splat, $.parenthesized_list_splat,
      )),
      optional(','),
    ),

    // Starlark has no yield statements
    _f_expression: $ => choice(
      $.expression,
      $.expression_list,
      $.pattern_list,
    ),

    // Add struct to keyword identifiers
    keyword_identifier: $ => choice(
      prec(-3, alias(
        choice(
          'print',
          'exec',
          'async',
          'await',
          'match',
          'struct',
        ),
        $.identifier,
      )),
      alias('type', $.identifier),
    ),
  },
});

module.exports.PREC = Python.PREC;

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return sep1(rule, ',');
}

/**
 * Creates a rule to match one or more of the rules separated by the separator
 *
 * @param {Rule} rule
 * @param {string} separator - The separator to use.
 *
 * @returns {SeqRule}
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
