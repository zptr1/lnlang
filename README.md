# lnlang

**lnlang** is an esoteric programming language where the code consists of numbered lines that dictate the program's execution flow. Each line can contain function calls that return numeric values, and the sum of these results is stored for each line after execution.

# Basic Guide

- Each line starts with a number and is followed by a list of function calls.
- Functions can be called with numeric arguments and always return a numeric value.
- The sum of function results is stored for each line after it's executed.

**Example**
```
This line is ignored
1 example(1, 2, 3) test(69)
2 hello()
3 world() helloworld() test(42)
4 This counts as a valid line, but it does not contain any valid function calls, so it is interpreted as an empty line.
```

In the example above, the first line is ignored because it doesn't start with a number. Line 1 calls the `example` and `test` functions, the next line calls the `hello` function, and the next calls the `world`, `helloworld`, and `test` functions. Line 4 is considered a valid line but doesn't have any function calls.

## Function Modifiers

- Function calls can be prefixed with `~` (bitwise NOT) or `!` (logical NOT) modifiers.
- Modifiers are applied to the returned result of the function.

**Example**
```scss
01 !nop() !nop()
02 get(1) get(1)
03 print(2)
```

In the example above, the `nop` function is called twice with the logical NOT modifier applied on the first line. Since `nop()` always returns zero, we can use logical NOT modifier to convert `0` to `1`. The results of both calls are added together, resulting in `2`.

The `get(ln)` function retrieves the result of a specific line (`n`). In this case, `get(1)` returns `2` because line 1 resulted in `2`. Calling `get(ln)` multiple times on the same line is equivalent to `n1 + n2 + ...`.

The `print(ln)` function outputs the result of a provided line (`n`) as a number.

Translated into pseudocode, the example can be represented as follows:
```py
a = 2
b = a + a
print(b)
```

## Control Flow

### goto (or jump)

In **lnlang**, the order of line numbers is not enforced. If the current line's number does not follow the sequential order, a jump is performed to the next line with the correct number.

```scss
01 hello()
02 world()
04 asd()
// The line above is numbered 4, which breaks the sequential order.
03 this_is_ignored()
04 this_is_ignored_as_well()
// Consequently, a jump occurs to the line numbered 5, maintaining the sequential order.
05 hello_world()
```

This feature allows for the creation of basic loops. 

For example, the following program counts from one to infinity:

```scss
01 !nop()
02 print(1)
00
^^ jumps to line 01
```

In the example above a jump to the start is performed when line 00 is encountered.
If the same line number is encountered multiple times, its result is added to the previously stored result instead of overriding it.
As a result, the value stored for line 01 keeps increasing, leading to an infinite counting loop.

### Calls

An important feature in this language is the `call(ln)` function, which allows for the execution of a specific line without triggering a jump to it. Additionally, **lnlang** incorporates a callstack, enabling recursive operations and more complex program flows.

```scss
01 call(3)
02 stop()
03 do_something()
04 this_wont_be_executed()
```

In the provided example, line 1 employs `call(3)` to invoke line 3 for execution. Consequently, the program proceeds to execute the `do_something()` function. However, the execution does not continue to line 4 since no jump was initiated. This behavior provides fine-grained control over program flow and allows for more flexible and intricate operations.

### Conditions

You can use the `assert(ln)` function to implement conditions in **lnlang**. This function checks the value of the provided line and skips the current and the next line if the value equals `0`.

Example:

```scss
01 nop()
02 assert(1) this_wont_be_executed()
03 this_wont_be_executed_as_well()
04 helloworld()
```

In this example, line 1 is set to `0`, so the `assert(1)` condition fails, causing lines 2 and 3 to be skipped and not executed. Line 4, `helloworld()`, will still be executed regardless of the condition result.

## Operations

### Subtraction

**lnlang** does not have a built-in operation for subtracting numbers. However, subtraction can be achieved using the bitwise NOT operation. Here's an example:

```scss
01 !nop() !nop() !nop() !nop() !nop()
02 !nop() !nop() !nop()
03 get(1) ~get(2) !nop()
04 print(3)
```

First, we set the value of the first line to 5 and the second line to 3 using multiple `!nop()` function calls. Then, we subtract line 2 from line 1 by adding line 1 with the bitwise NOT of line 2 and adding 1. The bitwise NOT of 3 is -4, so adding 1 would be the same as just negating it. Finally, we print the result, which should be 2.

Translated into pseudocode, the example can be represented as follows:
```py
a = 5
b = 3
c = a + (~b) + 1
print(c)
```

### Multiplication / Division

possible ig but good luck with that lmao

### Logical Operations

**lnlang** has several functions available to perform logical operations: `eq`, `lt`, and `gt`. These functions operate on two arguments, which reference line numbers.

* The `eq` function compares the values of the two lines. It returns `1` if the values are equal and `0` otherwise.
* The `lt` function checks if the value of the first line is smaller than the value of the second line.
* The `gt` function checks if the value of the first line is greater than the value of the second one.

# List of functions

| Signature         | Description |
|-------------------|-------------|
| `nop()`           | Performs no operation and always returns zero. |
| `get(ln)`         | Retrieves and returns the result stored for a specific line. |
| `print(ln)`       | Outputs the value of the provided line as a number. Returns the number of digits. |
| `input(ln)`       | Reads a number from stdin and returns it. |
| `write(ln)`       | Writes the character corresponding to the unicode code of the provided line's value to stdout. Returns `1`. |
| `read(ln)`        | Reads one character from stdin and returns its unicode charcode. |
| `assert(ln)`      | Checks if the value of the provided line is zero. If it is, it skips the current and the next lines. |
| `call(ln)`        | Executes the specified line without performing a jump to it |
| `eq(a, b)`        | Compares the values of two lines. Returns `1` if they are equal and `0` otherwise. |
| `lt(a, b)`        | Checks if the first line is less than the second line |
| `gt(a, b)`        | Checks if the first line is greater than the second line |
| `stop()`          | Halts the execution of the program. |

There is also a `debug(...chars)` function, which accepts any amount of arguments that represent the unicode charcodes and outputs a string constructed from the provided charcodes. This function exists only for debug puproses and shall not be used in actual programs.
