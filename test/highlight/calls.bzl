def my_rule(name, srcs = [], *args, **kwargs):
    #       ^ parameter
    #             ^ parameter
    #                         ^ parameter
    #                                 ^ parameter
    native.filegroup(name = name, srcs = srcs)
    # <- variable.builtin
    #      ^ method.call
    #                ^ parameter
    #                       ^ variable

LIMIT = len(struct(a = 1).a)
# <- constant
#       ^ function.builtin
#           ^ function.builtin
#                  ^ parameter
#                      ^ number
#                         ^ field

MyProvider = provider()
# <- variable
#            ^ function.builtin

info = MyProvider(x = True)
#      ^ constructor
#                     ^ boolean

s = "text\n" + r"raw"
#   ^ string
#        ^ string.escape
#              ^ string
