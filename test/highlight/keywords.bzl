load("//pkg:defs.bzl", "foo", renamed = "bar")
# <- include
#    ^ string.special
#                      ^ string

def f(x):
# <- keyword.function
#   ^ function
#     ^ parameter
    if foo():
    # <- conditional
    #  ^ function.call
        pass
        # <- keyword
    elif bar():
    # <- conditional
        return x
        # <- keyword.return
    else:
    # <- conditional
        x

for i in foo():
# <- repeat
#   ^ variable
#     ^ keyword.operator
#        ^ function.call
    continue
    # <- repeat
    break
    # <- repeat

a and b or c
# ^ keyword.operator
#     ^ variable
#       ^ keyword.operator

g = lambda y: y
#   ^ keyword.function
#          ^ parameter
