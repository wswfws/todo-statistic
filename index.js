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
    const match = line.match(/\/\/\s+TODO\s+(.+)/);
    if (match) {
        return match[1].trim();
    }
    return undefined;
}

function getToDoInText(text) {
    const lines = text.split('\n');
    return lines.map(line => getToDoInRow(line)).filter(t => t !== undefined)
}

const todos = [];
for (const file of files) {
    for (const todo in getToDoInText(file)) {
        todos.push(todo)
    }
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
