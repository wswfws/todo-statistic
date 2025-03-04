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
        case 'sort':
            processSortCommand(command_line_split);
            break
        case 'show':
            console.log(todos);
            break;
        case 'important':
            console.log(todos.filter(todo => todo.includes('!')));
            break;
        case 'user':
            if (args.length === 0) {
                console.log("need username")
                return;
            }
            console.log(getByUser(args[0]));
            break;
        case 'exit':
            process.exit(0);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function processSortCommand(command_line_split) {
    const type = command_line_split[1];
    switch (type) {
        case 'importance':
            console.log(sortImportant(todos));
            break;
        case 'user':
            console.log(sortUser(todos));
            break;
        case 'date':
            console.log(sortDate(todos));
            break;
        default:
            console.log('wrong type');
            break;
    }
}

function sortDate(todos) {
    return todos.sort((a, b) => {
        const aDate = getDate(a);
        const bDate = getDate(b);

        if (aDate === undefined)
            return 1;
        if (bDate === undefined)
            return -1;

        return bDate - aDate;
    });
}

function getDate(line) {
    const lines = line.split(';');

    if (lines.length < 3)
        return undefined;

    const dateLine = lines[1];

    return new Date(dateLine);
}

function sortUser(todos){
    return todos.sort((a, b) => {
        const aUser = getUser(a);
        const bUser = getUser(b);

        if (aUser === "anon")
            return 1;
        if (bUser === "anon")
            return -1;

        return aUser.localeCompare(bUser);
    })
}

function sortImportant(todos){
    return todos.sort((a, b) => {
        const aImportant = (a.match(/!/g) || []).length;
        const bImportant = (b.match(/!/g) || []).length;
        return bImportant - aImportant;
    });
}

// TODO you can do it!
