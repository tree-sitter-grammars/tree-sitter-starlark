/**
 * @file Starlark grammar for tree-sitter, written from the language spec.
 * @license MIT
 * @see {@link https://github.com/bazelbuild/starlark/blob/master/spec.md|Starlark spec}
 *
 * Node names follow tree-sitter-python where the construct is the same, so
 * that highlight queries and consumers written for the Python-derived
 * grammar keep working. Constructs Starlark does not have (classes, while,
 * try, with, decorators, yield, f-strings, type annotations, `is`, `**`,
 * set literals) are absent, and `load` is a statement.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Binding strength, lowest first (spec: "or < and < not < comparisons <
// | < ^ < & < << >> < + - < * / // % < unary < call").
const PREC = {
  lambda: -2,
  conditional: -1,
  parenthesized_expression: 1,
  or: 10,
  and: 11,
  not: 12,
  compare: 13,
  bitwise_or: 14,
  xor: 15,
  bitwise_and: 16,
  shift: 17,
  plus: 18,
  times: 19,
  unary: 20,
  call: 22,
};

export default grammar({
  name: 'starlark',

  extras: $ => [
    $.comment,
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
    $.line_continuation,
  ],

  conflicts: $ => [
    [$.primary_expression, $.pattern],
    [$.tuple, $.tuple_pattern],
    [$.list, $.list_pattern],
  ],

  supertypes: $ => [
    $.expression,
    $.primary_expression,
    $.pattern,
    $.parameter,
  ],

  externals: $ => [
    $._newline,
    $._indent,
    $._dedent,
    $.string_start,
    $._string_content,
    $.string_end,
    // Comments are external so that the scanner always runs and can keep
    // the block structure (dedents) intact during error recovery.
    $.comment,
    // Closing brackets are external so that the scanner knows not to emit
    // dedents inside brackets.
    ']',
    ')',
    '}',
  ],

  inline: $ => [
    $._simple_statement,
    $._compound_statement,
    $._suite,
    $._expressions,
    $._left_hand_side,
  ],

  word: $ => $.identifier,

  rules: {
    module: $ => repeat($._statement),

    _statement: $ => choice(
      $._simple_statements,
      $._compound_statement,
    ),

    // ----------------------------------------------------------------------
    // Simple statements

    _simple_statements: $ => seq(
      sep1($._simple_statement, ';'),
      optional(';'),
      $._newline,
    ),

    _simple_statement: $ => choice(
      $.load_statement,
      $.expression_statement,
      $.return_statement,
      $.pass_statement,
      $.break_statement,
      $.continue_statement,
    ),

    // load("//pkg:file.bzl", "symbol", local = "symbol")
    load_statement: $ => seq(
      'load',
      '(',
      field('module', $.string),
      repeat(seq(',', choice($.string, $.aliased_load))),
      optional(','),
      ')',
    ),

    aliased_load: $ => seq(
      field('alias', $.identifier),
      '=',
      field('name', $.string),
    ),

    // ExprStmt is a single Expression: a bare tuple needs parentheses.
    expression_statement: $ => choice(
      $.expression,
      $.assignment,
      $.augmented_assignment,
    ),

    return_statement: $ => seq('return', optional($._expressions)),
    pass_statement: _ => 'pass',
    break_statement: _ => 'break',
    continue_statement: _ => 'continue',

    _expressions: $ => choice($.expression, $.expression_list),

    // ----------------------------------------------------------------------
    // Compound statements

    _compound_statement: $ => choice(
      $.if_statement,
      $.for_statement,
      $.function_definition,
    ),

    if_statement: $ => seq(
      'if',
      field('condition', $.expression),
      ':',
      field('consequence', $._suite),
      repeat(field('alternative', $.elif_clause)),
      optional(field('alternative', $.else_clause)),
    ),

    elif_clause: $ => seq(
      'elif',
      field('condition', $.expression),
      ':',
      field('consequence', $._suite),
    ),

    else_clause: $ => seq('else', ':', field('body', $._suite)),

    for_statement: $ => seq(
      'for',
      field('left', $._left_hand_side),
      'in',
      field('right', $.expression),
      ':',
      field('body', $._suite),
    ),

    function_definition: $ => seq(
      'def',
      field('name', $.identifier),
      field('parameters', $.parameters),
      ':',
      field('body', $._suite),
    ),

    parameters: $ => seq('(', optional($._parameters), ')'),

    lambda_parameters: $ => $._parameters,

    _parameters: $ => seq(commaSep1($.parameter), optional(',')),

    parameter: $ => choice(
      $.identifier,
      $.default_parameter,
      $.list_splat_pattern,
      $.dictionary_splat_pattern,
      $.keyword_separator,
    ),

    default_parameter: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $.expression),
    ),

    list_splat_pattern: $ => seq('*', choice($.identifier, $.attribute, $.subscript)),
    dictionary_splat_pattern: $ => seq('**', choice($.identifier, $.attribute, $.subscript)),
    keyword_separator: _ => '*',

    _suite: $ => choice(
      alias($._simple_statements, $.block),
      seq($._indent, $.block),
      alias($._newline, $.block),
    ),

    block: $ => seq(repeat($._statement), $._dedent),

    // ----------------------------------------------------------------------
    // Assignment targets

    assignment: $ => seq(
      field('left', $._left_hand_side),
      '=',
      field('right', $._right_hand_side),
    ),

    augmented_assignment: $ => seq(
      field('left', $._left_hand_side),
      field('operator', choice(
        '+=', '-=', '*=', '/=', '//=', '%=',
        '>>=', '<<=', '&=', '^=', '|=',
      )),
      field('right', $._right_hand_side),
    ),

    _left_hand_side: $ => choice($.pattern, $.pattern_list),

    _right_hand_side: $ => choice($.expression, $.expression_list),

    // Unlike Python, an unparenthesized tuple cannot end with a comma.
    pattern_list: $ => seq($.pattern, repeat1(seq(',', $.pattern))),

    pattern: $ => choice(
      $.identifier,
      $.tuple_pattern,
      $.list_pattern,
      $.list_splat_pattern,
      $.attribute,
      $.subscript,
    ),

    tuple_pattern: $ => seq('(', optional($._patterns), ')'),
    list_pattern: $ => seq('[', optional($._patterns), ']'),
    _patterns: $ => seq(commaSep1($.pattern), optional(',')),

    expression_list: $ => prec.right(seq(
      $.expression,
      repeat1(seq(',', $.expression)),
    )),

    // ----------------------------------------------------------------------
    // Expressions

    expression: $ => choice(
      $.comparison_operator,
      $.not_operator,
      $.boolean_operator,
      $.lambda,
      $.primary_expression,
      $.conditional_expression,
    ),

    primary_expression: $ => choice(
      $.binary_operator,
      $.identifier,
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
      $.tuple,
      $.parenthesized_expression,
    ),

    not_operator: $ => prec(PREC.not, seq('not', field('argument', $.expression))),

    boolean_operator: $ => choice(
      prec.left(PREC.and, seq(
        field('left', $.expression), field('operator', 'and'), field('right', $.expression),
      )),
      prec.left(PREC.or, seq(
        field('left', $.expression), field('operator', 'or'), field('right', $.expression),
      )),
    ),

    binary_operator: $ => {
      const table = [
        ['+', PREC.plus], ['-', PREC.plus],
        ['*', PREC.times], ['/', PREC.times], ['//', PREC.times], ['%', PREC.times],
        ['|', PREC.bitwise_or], ['^', PREC.xor], ['&', PREC.bitwise_and],
        ['<<', PREC.shift], ['>>', PREC.shift],
      ];
      // @ts-ignore
      return choice(...table.map(([operator, precedence]) => prec.left(precedence, seq(
        field('left', $.primary_expression),
        // @ts-ignore
        field('operator', operator),
        field('right', $.primary_expression),
      ))));
    },

    unary_operator: $ => prec(PREC.unary, seq(
      field('operator', choice('+', '-', '~')),
      field('argument', $.primary_expression),
    )),

    // Comparisons are non-associative: `a < b < c` is a syntax error.
    comparison_operator: $ => prec.left(PREC.compare, seq(
      field('left', $.primary_expression),
      field('operator', choice(
        '<', '<=', '==', '!=', '>=', '>', 'in', alias(seq('not', 'in'), 'not in'),
      )),
      field('right', $.primary_expression),
    )),

    lambda: $ => prec(PREC.lambda, seq(
      'lambda',
      field('parameters', optional($.lambda_parameters)),
      ':',
      field('body', $.expression),
    )),

    conditional_expression: $ => prec.right(PREC.conditional, seq(
      $.expression, 'if', $.expression, 'else', $.expression,
    )),

    attribute: $ => prec(PREC.call, seq(
      field('object', $.primary_expression),
      '.',
      field('attribute', $.identifier),
    )),

    subscript: $ => prec(PREC.call, seq(
      field('value', $.primary_expression),
      '[',
      choice(
        field('subscript', $.slice),
        commaSep1(field('subscript', $.expression)),
      ),
      ']',
    )),

    slice: $ => seq(
      optional($.expression),
      ':',
      optional($.expression),
      optional(seq(':', optional($.expression))),
    ),

    call: $ => prec(PREC.call, seq(
      field('function', $.primary_expression),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq(
      '(',
      optional(commaSep1(choice(
        $.expression,
        $.list_splat,
        $.dictionary_splat,
        $.keyword_argument,
      ))),
      optional(','),
      ')',
    ),

    list_splat: $ => seq('*', $.expression),
    dictionary_splat: $ => seq('**', $.expression),

    keyword_argument: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $.expression),
    ),

    // ----------------------------------------------------------------------
    // Collections

    list: $ => seq('[', optional($._collection_elements), ']'),

    list_comprehension: $ => seq(
      '[', field('body', $.expression), $._comprehension_clauses, ']',
    ),

    dictionary: $ => seq(
      '{', optional(commaSep1($.pair)), optional(','), '}',
    ),

    dictionary_comprehension: $ => seq(
      '{', field('body', $.pair), $._comprehension_clauses, '}',
    ),

    pair: $ => seq(field('key', $.expression), ':', field('value', $.expression)),

    _comprehension_clauses: $ => seq(
      $.for_in_clause,
      repeat(choice($.for_in_clause, $.if_clause)),
    ),

    for_in_clause: $ => prec.left(seq(
      'for',
      field('left', $._left_hand_side),
      'in',
      field('right', $.expression),
    )),

    if_clause: $ => seq('if', $.expression),

    parenthesized_expression: $ => prec(PREC.parenthesized_expression, seq(
      '(', $.expression, ')',
    )),

    tuple: $ => seq('(', optional($._collection_elements), ')'),

    // `*x` is only valid among call arguments, not in list or tuple displays.
    _collection_elements: $ => seq(
      commaSep1($.expression),
      optional(','),
    ),

    // ----------------------------------------------------------------------
    // Literals

    string: $ => seq(
      $.string_start,
      repeat($.string_content),
      $.string_end,
    ),

    string_content: $ => prec.right(repeat1(choice(
      $.escape_sequence,
      $._not_escape_sequence,
      $._string_content,
    ))),

    escape_sequence: _ => token.immediate(prec(1, seq(
      '\\',
      choice(
        /u[a-fA-F\d]{4}/,
        /U[a-fA-F\d]{8}/,
        /x[a-fA-F\d]{2}/,
        /\d{1,3}/,
        /\r?\n/,
        /['"abfrntv\\]/,
      ),
    ))),

    _not_escape_sequence: _ => token.immediate('\\'),

    // Decimal literals do not start with 0 (there are no implicit octals).
    integer: _ => token(choice(
      /0[xX][0-9a-fA-F]+/,
      /0[oO][0-7]+/,
      /0|[1-9][0-9]*/,
    )),

    float: _ => token(choice(
      /[0-9]+\.[0-9]*([eE][+-]?[0-9]+)?/,
      /\.[0-9]+([eE][+-]?[0-9]+)?/,
      /[0-9]+[eE][+-]?[0-9]+/,
    )),

    identifier: _ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,

    true: _ => 'True',
    false: _ => 'False',
    none: _ => 'None',

    line_continuation: _ => token(seq('\\', choice(seq(optional('\r'), '\n'), '\0'))),

    // Listed in `externals` too, so that the scanner always runs; it is
    // still matched here as an ordinary token.
    comment: _ => token(seq('#', /.*/)),
  },
});


/** @param {RuleOrLiteral} rule */
function commaSep1(rule) {
  return sep1(rule, ',');
}

/**
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} separator
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
