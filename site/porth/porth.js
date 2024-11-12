// Porth Engine

// identifier = [a-zA-Z_][a-zA-Z0-9_]*
// number = -?[0-9]+
// string = "[^"]*"

const whitespaceRegex = /^\s+/;
const itemRegex = /^\S+/;

const numberRegex = /^-?[0-9]+(\.[0-9]+)?/;

define(function () {
    const TOKEN_TYPES = {
        Identifier: "Identifier",
        Number: "Number",
        String: "String",
        Chunk: "Chunk",
    };
    
    class PorthEngine {
        #tokenize(code) {
            const tokens = [];

            while (code.length > 0) {
                let match = code.match(whitespaceRegex);
                if (match) {
                    code = code.substring(match[0].length);
                    continue;
                }

                if (code[0] === '"') {
                    let i = 1;
                    while (i < code.length && code[i] !== '"') {
                        i++;
                    }
                    if (i === code.length) {
                        throw new Error("Unterminated string literal");
                    }
                    tokens.push({ type: TOKEN_TYPES.String, value: code.substring(1, i) });
                    code = code.substring(i + 1);
                    continue;
                }

                match = code.match(itemRegex);
                if (match) {
                    const item = match[0];
                    if (item.match(numberRegex)) {
                        tokens.push({ type: TOKEN_TYPES.Number, value: parseFloat(item) });
                    } else {
                        tokens.push({ type: TOKEN_TYPES.Identifier, value: item });
                    }
                    code = code.substring(item.length);
                    continue;
                }

                throw new Error("Invalid token");
            }

            return tokens;
        }

        constructor() {
            this.program = [];
            this.ip = 0;

            this.stack = [];

            this.initFromString("  print 42 push \"Hello, World!\"\npush 34\npush 35\nadd\nprint");
        }

        initFromString(codeString) {
            // split codeString into lines and remove empty lines
            const programString = codeString.split('\n').filter(line => line.trim() !== '').join(' ');
            console.log(programString);
            const tokens = this.#tokenize(programString);
            console.log(tokens);
        }
    }

    return { TOKEN_TYPES, PorthEngine };
});
