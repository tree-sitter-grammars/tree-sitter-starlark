# `bar.bzl`
load(":foo.bzl", "var", "fct") # loads `var`, and `fct` from `./foo.bzl`

var.append(6)  # runtime error, the list stored in var is frozen

fct()          # runtime error, fct() attempts to modify a frozen list
