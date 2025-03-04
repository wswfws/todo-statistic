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

function formatTable(todos) {
    // Разделяем каждую строку на части
    const parsedTodos = todos.map(line => {
        let [user, date, comment] = line.split(';').map(part => part.trim());
        const important = line.includes('!') ? "!" : " "
        if (user && !comment) {
            comment = user;
            user = undefined;
        }
        return {
            user: user || 'anon', date: date || 'no_date', comment: comment || "no_comment", important
        };
    });

    // Определяем максимальные длины для каждой колонки
    const maxUser = Math.max(...parsedTodos.map(t => t.user.length), 4); // Минимум 4 (длина "User")
    const maxDate = Math.max(...parsedTodos.map(t => t.date.length), 10); // Минимум 10 (длина "YYYY-MM-DD")
    const maxComment = Math.max(...parsedTodos.map(t => t.comment.length), 8); // Минимум 8 (длина "Comment")

    // Форматируем заголовок таблицы
    const header = ` ! | User ${' '.repeat(maxUser - 4)} | Date${' '.repeat(maxDate - 4)} | Comment${' '.repeat(maxComment - 7)} `;
    const separator = '-'.repeat(header.length);

    // Форматируем каждую строку
    const rows = parsedTodos.map(todo => {
        const user = todo.user.padEnd(maxUser, ' ');
        const date = todo.date.padEnd(maxDate, ' ');
        const comment = todo.comment.padEnd(maxComment, ' ');

        return ` ${todo.important} | ${user} | ${date} | ${comment} `;
    });

    // Объединяем заголовок, разделитель и строки
    return [header, separator, ...rows].join('\n');
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
        case 'date':
            processDateCommand(args);
            break;
        case 'sort':
            processSortCommand(command_line_split);
            break
        case 'show':
            console.log(formatTable(todos));
            break;
        case 'important':
            console.log(formatTable(todos.filter(todo => todo.includes('!'))));
            break;
        case 'user':
            if (args.length === 0) {
                console.log("need username")
                return;
            }
            console.log(formatTable(getByUser(args[0])));
            break;
        case 'exit':
            process.exit(0);
            break;
        default:
            console.log('wrong command');
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

    console.log(todos.filter(todo => {
        const todoDate = getDate(todo);
        return todoDate !== undefined && todoDate > date;
    }));
}

function processSortCommand(command_line_split) {
    const type = command_line_split[1];
    switch (type) {
        case 'importance':
            console.log(formatTable(sortImportant(todos)));
            break;
        case 'user':
            console.log(formatTable(sortUser(todos)));
            break;
        case 'date':
            console.log(formatTable(sortDate(todos)));
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

function sortUser(todos) {
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

function sortImportant(todos) {
    return todos.sort((a, b) => {
        const aImportant = (a.match(/!/g) || []).length;
        const bImportant = (b.match(/!/g) || []).length;
        return bImportant - aImportant;
    });
}

// TODO you can do it!
