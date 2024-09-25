const programs = {
    "pong": function()
    {
        window.open("/pongerslair", '_blank');
        print("PONG for PengOS (c) 1988 Ponger");
    },
    
    "date": function()
    {
        print((new Date()).toDateString());
    },

    "wait": async function()
    {
        print("Waiting...");
        return new Promise(
            (resolve, reject) => {
                setTimeout(
                    resolve,
                    5000
                );
            }
        )
    }
}

const Program = Symbol();

const fileSystem = {
    "pengos": {

    },
    "software": {
        "games": {
            "pong": {
                "pong.exe": Program
            }
        }
    },
    "documents": {
        "pengers": {}
    },
    "password.txt": "silversurfer7",
    "date.exe": Program,
    "wait.exe": Program
}

const commands = [

    function help()
    {
        const helpText = {
            "help": "List available commands",
            "look": "Display contents of current directory",
            "go": "  Navigate directories",
            "up": "  Navigate to parent directory",
            "run": " Execute program",
            "open": "Display file",
            "take": "Add a program to the command list",
            "drop": "Remove a program from the command list"
        };

        for (let command of commands)
        {
            if (helpText[command.name])
            {
                print(command.name + "   " + helpText[command.name]);
            }
            else
            {
                print(command.name + ": HELP ENTRY NOT FOUND");
            }
        }

        if (extraCommands.length > 0)
        {
            print("");
            print("Available programs:")
            for (let command of extraCommands)
            {
                print(command);
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
            if (isDirectory(dir[name]))
            {
                print(name + "/");
            }
            else
            {
                print(name);
            }
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

    async function run(name)
    {
        let dir = path[path.length - 1];
        let program = dir[name];

        if (isProgram(program))
        {
            return await programs[name.split(".")[0]]();
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
    },

    function take(name)
    {
        let dir = path[path.length - 1];
        let program = dir[name];

        if (isProgram(program))
        {
            extraCommands.push(name.split(".")[0]);
            localStorage.setItem("pengos/programs", JSON.stringify(extraCommands));
            print("Added " + name.toUpperCase() + " to command list.");
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

    function drop(name)
    {
        extraCommands = extraCommands.filter(x => x != name);
        localStorage.setItem("pengos/programs", JSON.stringify(extraCommands));
    }

];

function isDirectory(thing)
{
    return typeof(thing) == "object";
}

function isProgram(thing)
{
    return thing === Program;
}

function isFile(thing)
{
    return typeof(thing) == "string";
}

let path = [fileSystem];
let pathNames = ["A:"];

let extraCommands = [];
{
    let storedCommands = localStorage.getItem("pengos/programs");
    if (storedCommands !== null)
    {
        extraCommands = JSON.parse(storedCommands);
    }
}

let print;

function startup()
{
    return "PengOS 2.1\n(c) Copyright 1985 PengCorp"
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

async function submit(input, printFunction)
{
    let tokens = input.split(" ");

    if (!tokens) return "";

    let command = tokens[0];
    let args = tokens.slice(1);

    print = printFunction;

    for (let f of commands)
    {
        if (f.name == command || command == f.name[0])
        {
            await f(...args);            
            return;
        }
    }

    let f = programs[command];
    if (f !== undefined)
    {
        await f(...args);
        return;
    }

    print("Unknown command: " + command);
    print("Try \"help\" or \"h\" to see available commands");
}