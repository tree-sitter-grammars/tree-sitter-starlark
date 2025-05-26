#ifndef TREE_SITTER_STARLARK_H_
#define TREE_SITTER_STARLARK_H_

typedef struct TSLanguage TSLanguage;

#ifdef __cplusplus
extern "C" {
#endif

const TSLanguage *tree_sitter_starlark(void);

#ifdef __cplusplus
}
#endif

#endif // TREE_SITTER_STARLARK_H_
