if foo():
# <- conditional
    pass
    # <- keyword
elif bar():
# <- conditional
    pass
else:
# <- conditional
    foo

return
# ^ keyword.return

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
