const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function getToDoInRow(row) {
    const match = row.match(/\/\/\s+TODO\s+(.+)/);
    if (match) {
        return match[1].trim();
    }
    return undefined;
}

function getToDoInText(text) {
    const lines = text.split('\n');
    return lines.map(line => getToDoInRow(line))
}

const todos = [];
for (const file of files) {
    for (const todo of getToDoInText(file)) {
        if (todo) {
            todos.push(todo)
        }
    }
}
const getUser = (todo) => {
    const parts = todo.split(";");
    if (parts.length > 2) return parts[0];
    return "anon"
}

function getByUser(user) {
    return todos.filter(todo => getUser(todo) === user);
}


function processCommand(command_line) {
    const command_line_split = command_line.split(' ');
    const command = command_line_split[0];
    const args = command_line_split.slice(1);
    switch (command) {
        case 'show':
            console.log(todos);
            break;
        case 'user':
            if (args.length === 0) {
                console.log("need username")
                return;
            }
            console.log(getByUser(args[0]));
        case 'exit':
            process.exit(0);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
