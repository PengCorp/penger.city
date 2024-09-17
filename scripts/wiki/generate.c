#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <assert.h>
#include <stdlib.h>
#include <stdarg.h>
#include <stdint.h>
#include <stdbool.h>

#include "header_data.c"

#include "logka.h"

#define STB_DS_IMPLEMENTATION
#include "stb_ds.h"

#define USAGE_TEXT "Usage: generate <input file>"

typedef struct {
    char *pointer;
    size_t size;
} Slice;

typedef struct {
    size_t character;
    size_t line;
} Location;

typedef enum {
    INVALID_TOKEN = 0,

    TOKEN_OPEN_PAREN,
    TOKEN_CLOSED_PAREN,
    TOKEN_IDENTIFIER,
    TOKEN_NUMBER,
    TOKEN_SYMBOL,
    TOKEN_STRING_LITERAL,

    END_OF_FILE,
} TokenType;

static char *token_names[] = {
    [INVALID_TOKEN] = "invalid token",
    [TOKEN_OPEN_PAREN] = "oepn paren",
    [TOKEN_CLOSED_PAREN] = "closed paren",
    [TOKEN_IDENTIFIER] = "identifier",
    [TOKEN_NUMBER] = "number",
    [TOKEN_SYMBOL] = "symbol",
    [TOKEN_STRING_LITERAL] = "string",
    [END_OF_FILE] = "end of file",
};

typedef struct {
    TokenType type;
    Slice text_slice;
    Location location;
    union {
        uint64_t number_value;
        Slice string_value;
    };
} Token;

typedef enum {
    EXPR_EXPRESSION = 0,
    EXPR_NUMBER,
    EXPR_IDENTIFIER,
    EXPR_STRING,
} ExpressionType;

typedef struct Expression {
    ExpressionType type;

    union {
        struct Expression *children;
        uint64_t number_value;
        Slice identifier_value;
        Slice string_value;
    };
} Expression;

typedef Expression (*BuiltinFunctionPointer)(Expression *expression);

typedef struct { char *key; BuiltinFunctionPointer value; } KeywordBuiltinPair;

static KeywordBuiltinPair *keyword_lookup;

typedef struct {
    size_t current_character;
    size_t current_line;
    Slice data;
    size_t cursor;
    Token current_token;
    char *filename;
    Expression global_expression;
} ParserContext;

static ParserContext context = {
    .current_character = 0,
    .current_line = 1,
    .cursor = 0,
    .data = {0},
    .current_token = {0},
    .filename = NULL,
    .global_expression = {0},
};

void read_entire_file(const char *filename) {
    FILE *f = fopen(filename, "r");

    if(f == NULL) {
        error("Could not open file '%s': %s\n", filename, strerror(errno));
        exit(1);
    }

    fseek(f, 0, SEEK_END);
    long fsize = ftell(f);
    fseek(f, 0, SEEK_SET);

    char *string = malloc(fsize + 1);

    if(string == NULL) {
        error("malloc failed!");
        exit(1);
    }

    fread(string, fsize, 1, f);
    fclose(f);

    string[fsize] = 0;

    context.data = (Slice) {
        .pointer = string,
        .size = fsize,
    };
}

Location current_location() {
    return (Location) {
        .character = context.current_character,
        .line = context.current_line,
    };
}

bool can_tokenize() {
    return context.cursor < context.data.size;
}

char current_character() {
    return context.data.pointer[context.cursor];
}

void bump_tokenizer() {
    context.cursor += 1;
    context.current_character += 1;
}

bool is_whitespace(char c) {
    return c == ' ' || c == '\n' || c == '\t';
}

bool is_alpha(char c) {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
           c == '_';
}

bool is_numeric(char c) {
    return c >= '0' && c <= '9';
}

bool is_alphanumeric(char c) {
    return is_alpha(c) || is_numeric(c);
}

bool is_identifier_allowed(char c) {
    if(is_alphanumeric(c)) return true;

    switch(c) {
    case '!':
    case '?':
    case ':':
        return true;
    default:
        return false;
    }
}

void eat_whitespace() {
    while(can_tokenize() && is_whitespace(current_character())) {
        if(context.current_character == '\n')
            context.current_line += 1;
        bump_tokenizer();
    }
}

__attribute__((noreturn))
void die(const char *format, ...) {
    va_list args;
    va_start(args, format);
    fprintf(
        stdout,
        "%s%s:%zu:%zu: ",
        ERROR_LABEL,
        context.filename,
        context.current_token.location.line,
        context.current_token.location.character
    );

    vfprintf(stdout, format, args);

    fprintf(stdout, ".\n");

    va_end(args);

    exit(1);
}

Token next_token() {

    eat_whitespace();

    if(!can_tokenize()) return (Token) { .type = END_OF_FILE };

    char c = current_character();
    Token token;
    token.location = current_location();

    if(is_alpha(c)) {
        token.type = TOKEN_IDENTIFIER;
        size_t start = 0;
        while(can_tokenize() && is_identifier_allowed(current_character())) {
            start += 1;
            bump_tokenizer();
        }
        token.text_slice = (Slice) {
            .pointer = context.data.pointer + context.cursor - start,
            .size = start,
        };
    } else if(is_numeric(c)) {
        token.type = TOKEN_NUMBER;
        size_t start = 0;
        while(can_tokenize() && is_numeric(current_character())) {
            start += 1;
            bump_tokenizer();
        }
        token.text_slice = (Slice) {
            .pointer = context.data.pointer + context.cursor - start,
            .size = start,
        };

        char buffer[256] = {0};

        snprintf(
            buffer,
            token.text_slice.size + 1,
            token.text_slice.pointer
        );

        token.number_value = atoi(buffer);
    } else {

        switch(c) {
        case '(': {
            token.type = TOKEN_OPEN_PAREN;
            token.text_slice = (Slice) {
                .pointer = context.data.pointer + context.cursor,
                .size = 1,
            };
            bump_tokenizer();
        } break;
        case ')': {
            token.type = TOKEN_CLOSED_PAREN;
            token.text_slice = (Slice) {
                .pointer = context.data.pointer + context.cursor,
                .size = 1,
            };
            bump_tokenizer();
        } break;
        case ':': {
            token.type = TOKEN_SYMBOL;
            size_t start = 0;
            while(can_tokenize() && is_identifier_allowed(current_character())) {
                start += 1;
                bump_tokenizer();
            }
            token.text_slice = (Slice) {
                .pointer = context.data.pointer + context.cursor - start,
                .size = start,
            };
        } break;
        case '"': {
            token.type = TOKEN_STRING_LITERAL;
            char *start = context.data.pointer + context.cursor;
            bump_tokenizer();
            while(true) {
                if(!can_tokenize()) die("unclosed string");
                bump_tokenizer();
                if(current_character() == '"') break;
            }

            size_t size = context.data.pointer + context.cursor - start + 1;

            token.text_slice = (Slice) {
                .pointer = start,
                .size = size,
            };

            token.string_value = (Slice) {
                .pointer = start + 1,
                .size = size - 2,
            };

            bump_tokenizer();
        } break;
        default:
            error("Unknown character '%c'!", c);
            exit(1);
        }
    }

    context.current_token = token;

    return token;
}

Token expect(TokenType type) {
    Token new_token = next_token();
    if(new_token.type != type) {
        die("Expected token '%s', found token '%s'", token_names[type], token_names[new_token.type]);
    }
    return new_token;
}

Expression evaluate_expression(Expression *expression);
Expression evaluate_expression(Expression *expression) {
    switch(expression->type) {
    case EXPR_EXPRESSION: {
        if(arrlen(expression->children) < 1) {
            die("wtf empty expression bro...");
        } else {
            if(expression->children[0].type == EXPR_IDENTIFIER) {
                char buffer[128] = {0};
                memcpy(buffer, expression->children[0].identifier_value.pointer, expression->children[0].identifier_value.size);
                buffer[127] = 0;
                KeywordBuiltinPair *pair = shgetp_null(keyword_lookup, buffer);
                if(pair == NULL) {
                    die("Unknown identifier '%s'", buffer);
                } else {
                    return pair->value(expression);
                }
            } else {
                die("unimplemented");
            }
        }
    } break;
    default:
        return *expression;
    }
}

Expression builtin_emit(Expression *expression) {
    Expression ret = (Expression) { .type = EXPR_NUMBER };

    long arg_count = arrlen(expression->children);

    if(arg_count < 2) {
        ret.number_value = printf("\n");
    } else {
        long counter = 0;

        for(long i = 1; i < arg_count; i++) {
            Expression arg = expression->children[i];

            if(arg.type == EXPR_EXPRESSION)
                arg = evaluate_expression(&arg);

            switch(arg.type) {
            case EXPR_NUMBER: {
                counter += printf("%li\n", arg.number_value);
            } break;
            case EXPR_IDENTIFIER: {
                char buffer[128] = {0};
                memcpy(buffer, arg.identifier_value.pointer, arg.identifier_value.size);
                buffer[127] = 0;
                counter += printf("%s\n", buffer);
            } break;
            case EXPR_STRING: {
                char buffer[4096] = {0};
                memcpy(buffer, arg.string_value.pointer, arg.string_value.size);
                buffer[4095] = 0;
                counter += printf("%s\n", buffer);
            } break;
            case EXPR_EXPRESSION:
                die("Cant print expression, idiot");
            }
        }

        ret.number_value = counter;
    }

    return ret;
}

Expression builtin_concat(Expression *expression) {
    Expression ret = (Expression) { .type = EXPR_STRING };

    long arg_count = arrlen(expression->children);

    size_t counter = 0;

    for(long i = 1; i < arg_count; i++) {
        Expression arg = expression->children[i];

        if(arg.type == EXPR_EXPRESSION) {
            expression->children[i] = evaluate_expression(&arg);
            arg = expression->children[i];
        }

        if(arg.type != EXPR_STRING) die("Can only concat strings");

        counter += arg.string_value.size;
    }

    char *buffer = malloc(counter + 1);

    if(buffer == NULL) die("malloc fucking died");

    char *cursor = buffer;

    for(long i = 1; i < arg_count; i++) {
        Expression arg = expression->children[i];

        memcpy(cursor, arg.string_value.pointer, arg.string_value.size);

        cursor += arg.string_value.size;
    }

    buffer[counter] = '\0';

    ret.string_value = (Slice) {
        .pointer = buffer,
        .size = counter
    };

    return ret;
}

Expression builtin_title(Expression *expression) {

    long arg_count = arrlen(expression->children);

    if(arg_count < 2) die("title expects a string argument");
    if(arg_count > 3) die("too many arguments passed to title");

    Expression arg = expression->children[1];

    if(arg.type == EXPR_EXPRESSION)
        arg = evaluate_expression(&arg);

    if(arg.type != EXPR_STRING) die("Title expects a string but got something else lol");

    char title_buffer[4096] = {0};
    memcpy(title_buffer, arg.string_value.pointer, arg.string_value.size);
    title_buffer[4095] = '\0';

    printf("<h2>%s</h2>\n", title_buffer);

    return (Expression) { .type = EXPR_NUMBER, .number_value = 1 };
}

Expression builtin_break(Expression *expression) {
    (void) expression;
    return (Expression) {
        .type = EXPR_STRING,
        .string_value = (Slice) {
            .pointer = "<br/>",
            .size = 5
        }
    };
}

static int paren_counter = 0;

void parse_expression(Expression *expression);
void parse_expression(Expression *expression) {

    while(true) {
        Token token = next_token();

        switch(token.type) {
        case INVALID_TOKEN:
            die("Encountered invalid token! WTF??");
            return;
        case TOKEN_NUMBER: {
            expression->type = EXPR_EXPRESSION;
            Expression number = { .type = EXPR_NUMBER, .number_value = token.number_value };
            arrput(expression->children, number);
        } break;
        case TOKEN_OPEN_PAREN: {
            paren_counter += 1;
            Expression sub_expression = { .type = EXPR_EXPRESSION };
            parse_expression(&sub_expression);
            arrput(expression->children, sub_expression);
        } break;
        case TOKEN_CLOSED_PAREN:
            if(paren_counter <= 0) die("Unbalanced closing paren");
            paren_counter -= 1;
            return;
        case END_OF_FILE:
            if(paren_counter != 0) die("File ended while there are unclosed parens, moron");
            return;
        case TOKEN_IDENTIFIER: {
            expression->type = EXPR_EXPRESSION;
            Expression ident = { .type = EXPR_IDENTIFIER, .identifier_value = token.text_slice };
            arrput(expression->children, ident);
        } break;
        case TOKEN_STRING_LITERAL: {
            expression->type = EXPR_EXPRESSION;
            Expression str = { .type = EXPR_STRING, .string_value = token.string_value };
            arrput(expression->children, str);
        } break;
        default:
            die("Unimplemented token!");
        }
    }
}

void begin_html() {
    char buffer[header_html_len + 1];
    memcpy(buffer, header_html, header_html_len);
    buffer[header_html_len] = '\0';
    puts(buffer);
}

void end_html() {
    printf("</body></html>\n");
}

int main(int argc, char *argv[]) {
    if(argc < 2) {
        error(USAGE_TEXT);
        exit(1);
    } else if(argc > 2) {
        error("Too many arguments passed.");
        error(USAGE_TEXT);
        exit(1);
    }

    shput(keyword_lookup, "emit", builtin_emit);
    shput(keyword_lookup, "concat", builtin_concat);
    shput(keyword_lookup, "title", builtin_title);
    shput(keyword_lookup, "break", builtin_break);

    context.filename = argv[1];

    read_entire_file(argv[1]);

    parse_expression(&context.global_expression);

    begin_html();

    for(long int i = 0; i < arrlen(context.global_expression.children); i++) {
        evaluate_expression(&context.global_expression.children[i]);
    }

    end_html();

    return 0;
}
