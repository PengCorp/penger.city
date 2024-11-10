define(function () {
    const tokenizePorth = (input) => {
        const tokens = [];
        let i = 0;
        
        const isDigit = (char) => /[-\d]/.test(char);
        const isAlpha = (char) => /[a-zA-Z_]/.test(char);
        
        while (i < input.length) {
            const char = input[i];
        
            // Skip whitespace
            if (/\s/.test(char)) {
            i++;
            continue;
            }
        
            // Number
            if (isDigit(char)) {
                let numStr = char;
                i++;
                while (i < input.length && isDigit(input[i])) {
                    numStr += input[i];
                    i++;
                }
                tokens.push({ type: "Number", value: numStr });
                continue;
            }
        
            // Identifier
            if (isAlpha(char)) {
                let ident = char;
                i++;
                while (i < input.length && (isAlpha(input[i]) || isDigit(input[i]))) {
                    ident += input[i];
                    i++;
                }
                tokens.push({ type: "Identifier", value: ident });
                continue;
            }
        
            // String (double quotes)
            if (char === '"') {
                let str = "";
                i++; // Skip initial quote
                while (i < input.length && input[i] !== '"') {
                    str += input[i];
                    i++;
                }
                i++; // Skip closing quote
                tokens.push({ type: "String", value: str });
                continue;
            }
        
            throw new Error(`Unexpected character: ${char}`);
        }
        
        return tokens;
    }
    
    class PorthEngine {
        constructor() {

        }

        parseLine(line) {
            // first word in the line is the command, extract that
            const split = line.split(' ').filter(word => word.trim() !== '');
            const command = [0];
        }

        initFromString(codeString) {
            // split codeString into lines and remove empty lines
            const lines = codeString.split('\n').filter(line => line.trim() !== '');

            
        }
    }

    return { PorthEngine };
});
