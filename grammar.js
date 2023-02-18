/**
 * @file Starlark grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 * @see {@link https://github.com/bazelbuild/starlark|official website}
 * @see {@link https://github.com/bazelbuild/starlark/blob/master/spec.md|official syntax spec}
 * @see {@link https://bazel.build/rules/language|official language guide}
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const python = require('tree-sitter-python/grammar');

const PREC = {
  // this resolves a conflict between the usage of ':' in a lambda vs in a
  // typed parameter. In the case of a lambda, we don't allow typed parameters.
  lambda: -2,
  typed_parameter: -1,
  conditional: -1,

  parenthesized_expression: 1,
  parenthesized_list_splat: 1,
  or: 10,
  and: 11,
  not: 12,
  compare: 13,
  bitwise_or: 14,
  bitwise_and: 15,
  xor: 16,
  shift: 17,
  plus: 18,
  times: 19,
  unary: 20,
  power: 21,
  call: 22,
};

module.exports = grammar(python, {
  name: 'starlark',

  rules: {
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
      alias('match', $.identifier),
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
    ),

    // Starlark has no `is` operator
    comparison_operator: $ => prec.left(PREC.compare, seq(
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
            seq('not', 'in'),
          )),
        $.primary_expression,
      )),
    )),

    // Starlark has no generator expressions
    call: $ => prec(PREC.call, seq(
      field('function', $.primary_expression),
      field('arguments', $.argument_list),
    )),


    // Starlark has no yield statements
    _right_hand_side: $ => choice(
      $.expression,
      $.expression_list,
      $.assignment,
      $.augmented_assignment,
    ),

    // Starlark has no yield statements
    parenthesized_expression: $ => prec(PREC.parenthesized_expression, seq(
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
    ),

    // Add struct to keyword identifiers
    keyword_identifier: $ => prec(-3, alias(
      choice(
        'print',
        'exec',
        'async',
        'await',
        'struct',
      ),
      $.identifier,
    )),
  },
});

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
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
* @return {SeqRule}
*
*/
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
