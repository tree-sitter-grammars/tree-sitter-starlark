package tree_sitter_starlark_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_starlark "github.com/tree-sitter-grammars/tree-sitter-starlark/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_starlark.Language())
	if language == nil {
		t.Errorf("Error loading Starlark grammar")
	}
}
