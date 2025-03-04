const path = require('path');
const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(filePath => ({ path: filePath, content: readFile(filePath) }));
}

function getToDoInRow(row) {
    const match = row.match(/\/\/\s+TODO\s+(.+)/);
    return match ? match[1].trim() : undefined;
}

function getToDoInText(text) {
    return text.split('\n').map(line => getToDoInRow(line));
}

const todos = [];
for (const file of files) {
    const todosInFile = getToDoInText(file.content);
    for (const todoText of todosInFile) {
        if (todoText) {
            todos.push({ text: todoText, path: file.path });
        }
    }
}

function formatTable(todos) {
    const parsedTodos = todos.map(todoObj => {
        const line = todoObj.text;
        let [user, date, comment] = line.split(';').map(part => part.trim());
        const important = line.includes('!') ? "!" : " ";
        if (user && !comment) {
            comment = user;
            user = undefined;
        }
        const filename = path.basename(todoObj.path);
        return {
            user: user || 'anon',
            date: date || 'no_date',
            comment: comment || 'no_comment',
            important,
            filename: filename || 'unknown'
        };
    });

    const maxUser = Math.max(...parsedTodos.map(t => t.user.length), 4);
    const maxDate = Math.max(...parsedTodos.map(t => t.date.length), 10);
    const maxFilename = Math.max(...parsedTodos.map(t => t.filename.length), 8);
    const maxComment = Math.max(...parsedTodos.map(t => t.comment.length), 7);

    const header = ` ! | User ${' '.repeat(maxUser - 4)} | Date${' '.repeat(maxDate - 4)} | Filename ${' '.repeat(maxFilename - 8)} | Comment${' '.repeat(maxComment - 7)} `;
    const separator = '-'.repeat(header.length);

    const rows = parsedTodos.map(todo => {
        const user = todo.user.padEnd(maxUser, ' ');
        const date = todo.date.padEnd(maxDate, ' ');
        const filename = todo.filename.padEnd(maxFilename, ' ');
        const comment = todo.comment.padEnd(maxComment, ' ');
        return ` ${todo.important} | ${user} | ${date} | ${filename} | ${comment} `;
    });

    return [header, separator, ...rows].join('\n');
}

const getUser = (todoText) => {
    const parts = todoText.split(";");
    return parts.length > 2 ? parts[0] : "anon";
}

function getByUser(user) {
    return todos.filter(todo => getUser(todo.text) === user);
}

function processCommand(command) {
    const args = command.split(' ');
    switch (args[0]) {
        case 'date':
            processDateCommand(args.slice(1));
            break;
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            console.log(formatTable(todos));
            break;
        case 'important':
            console.log(formatTable(todos.filter(todo => todo.text.includes('!'))));
            break;
        case 'user':
            if (args.length < 2) {
                console.log("Error: Username required");
                break;
            }
            console.log(formatTable(getByUser(args[1])));
            break;
        case 'sort':
            handleSortCommand(args[1]);
            break;
        default:
            console.log('Invalid command');
            break;
    }
}

function processDateCommand(args) {
    if (args.length === 0) {
        console.log('Need date')
        return;
    }

    const date = new Date(args[0]);

    if (date.toString() === 'Invalid Date') {
        console.log('Wrong date');
        return;
    }

    console.log(formatTable(todos.filter(todo => {
        const todoDate = getDate(todo.text);
        return todoDate !== undefined && todoDate > date;
    })));
}

function handleSortCommand(sortType) {
    let sorted;
    switch (sortType) {
        case 'importance':
            sorted = [...todos].sort((a, b) =>
                (b.text.match(/!/g) || []).length - (a.text.match(/!/g) || []).length);
            break;
        case 'user':
            sorted = [...todos].sort((a, b) => {
                const aUser = getUser(a.text);
                const bUser = getUser(b.text);
                return aUser.localeCompare(bUser) || (aUser === 'anon' ? 1 : -1);
            });
            break;
        case 'date':
            sorted = [...todos].sort((a, b) => {
                const aDate = getDate(a.text);
                const bDate = getDate(b.text);
                return (bDate || 0) - (aDate || 0);
            });
            break;
        default:
            console.log('Invalid sort type');
            return;
    }
    console.log(formatTable(sorted));
}

function getDate(todoText) {
    const parts = todoText.split(';');
    return parts.length >= 2 ? new Date(parts[1].trim()) : null;
}

// TODO: Add more test cases