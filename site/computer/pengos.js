const fileSystem = {
    "docs": {
        "pics": {}
    },
    "password.txt": "silversurfer7",
    "date.exe": () => (new Date()).toDateString()
}

const commands = [

    function help()
    {
        const helpText = {
            "help": "List available commands",
            "look": "Display contents of current directory",
            "go": "Navigate directories",
            "up": "Navigate to parent directory",
            "run": "Execute program",
            "open": "Display file"
        };

        for (let command of commands)
        {
            if (helpText[command.name])
            {
                print(command.name + ": " + helpText[command.name]);
            }
            else
            {
                print(command.name + ": HELP ENTRY NOT FOUND");
            }
        }
    },

    function look()
    {
        let dir = path[path.length - 1];

        print("Currently in: " + pathNames.join("/"))
        print("")
        
        for (let name of Object.keys(dir))
        {
            print(name)
        }
    },

    function go(name)
    {
        let dir = path[path.length - 1];
        let newDir = dir[name];

        if (!newDir)
        {
            print("Does not exist")
        }
        else if (!isDirectory(newDir))
        {
            print("Not a directory")
        }
        else
        {
            path.push(newDir);
            pathNames.push(name);
        }

        print("Now in " + pathNames.join("/"));
    },

    function up()
    {
        if (path.length > 1)
        {
            path = path.slice(0, path.length - 1);
            pathNames = pathNames.slice(0, pathNames.length - 1);
        }

        print("Went up to " + pathNames.join("/"));
    },

    function run(name)
    {
        let dir = path[path.length - 1];
        let program = dir[name];

        if (isProgram(program))
        {
            print(program());
        }
        else if (program === undefined)
        {
            print("Does not exist");
        }
        else
        {
            print("Not executable")
        }
    },

    function open(name)
    {
        let dir = path[path.length - 1];
        let file = dir[name];

        if (isFile(file))
        {
            print(file);
        }
        else if (file === undefined)
        {
            print("Does not exist");
        }
        else
        {
            print("Not readable")
        }
    }

];

function isDirectory(thing)
{
    return typeof(thing) == "object";
}

function isProgram(thing)
{
    return typeof(thing) == "function";
}

function isFile(thing)
{
    return typeof(thing) == "string";
}

function print(text)
{
    stdout += text + "\n";
}

let path = [fileSystem];
let pathNames = ["A:"];

let stdout;

function startup()
{
    return "PengOS 2.1\n(c) Copyright PengCorp 1985-2024"
}

function tab(input)
{
    let tokens = input.split(" ");
    if (!tokens) return "";
    let token = tokens[tokens.length - 1];

    let dir = path[path.length - 1];    
    for (let name of Object.keys(dir))
    {
        let prefix = name.slice(0, token.length);
        if (prefix === token)
        {
            return name.slice(token.length);
        }
    }

    return "";
}

function submit(input)
{
    let tokens = input.split(" ");

    if (!tokens) return "";

    let command = tokens[0];
    let args = tokens.slice(1);

    for (let f of commands)
    {
        if (f.name == command || command == f.name[0])
        {
            stdout = "";
            f(...args);
            return stdout;
        }
    }

    return "Unknown command: " + command;
}