const fs = require("../utils/json-manager.js");

const prefix = "?todo";
const requiredRole = "398732282229293059";

const files = {
    mainPath: "data/todo_lists/"
}

class TodoList{
    todoList = [];

    toJSON(){
        return {
            todo: this.todoList
        }
    }
}

class TodoItem {
    constructor(count, content, author){
        this.count = count;
        this.content = content;
        this.author = author;
    }

    toJSON() {
        return  {
            count: this.count,
            content: this.content,
            author: this.author,
        }
    }
}

function getFilePath(channelId){
    return files.mainPath + channelId + ".json";
}

function saveTodoList(channelId, todoItems){
    const todoList = new TodoList();

    for (let todoItem of todoItems){
        let count = todoList.todoList.length + 1;
        const item = new TodoItem(count, todoItem.content, todoItem.author);

        todoList.todoList.push(item);
    }

    let options = null;
    let spacing = 2;
    const jsonTodoList = JSON.stringify(todoList, options, spacing);
    const filePath = getFilePath(channelId);

    fs.saveFile(filePath, jsonTodoList);
}

function newTodo(channelId, messageContent, messageAuthor){
    const filePath = getFilePath(channelId);
    let fileTodoItems = fs.readFile(filePath);
    let todoListCount = fileTodoItems.todo.length + 1;
    const todoItem = new TodoItem(todoListCount, messageContent, messageAuthor);

    fileTodoItems.todo.push(todoItem);

    saveTodoList(channelId, fileTodoItems.todo);

    let messageResponse = `Todo item #${todoItem.count} added successfully! Use '?todo' to see the current todo list of this channel.`;
    
    return messageResponse;
}

function displayTodo(channelId, channelName){
    const filePath = getFilePath(channelId);
    const fileTodoItems = fs.readFile(filePath);

    const messageResponseEmbed = {
        color: 0xFB4E88,
        author: {
            name: `Channel Todo List`,
            icon_url: 'https:\/\/www.dropbox.com\/temp_thumb_from_token\/s\/u5ajixq3x3ubmsp?preserve_transparency=False&size=1200x1200&size_mode=4',
        },
        description: '```markdown\n' + channelName + '\n```',
        fields: [
            {
                name: '',
                value: '',
            },
        ],
    };

    messageResponseEmbed.fields[0].value += "```markdown\n";

    if (!fileTodoItems.todo.length) {
        messageResponseEmbed.fields[0].value += "It looks like this channel doesn't have any todo items!\n";
    } else {
        //FIXME add limit (if the next item + the current items length is more than 1000, create a new field and start adding there instead)

        for (let todoItem of fileTodoItems.todo){
            let capitalizedTodoItemContent = todoItem.content.charAt(0).toUpperCase() + todoItem.content.slice(1);

            messageResponseEmbed.fields[0].value +=  `${todoItem.count}. ${capitalizedTodoItemContent} ${(todoItem.author ? '(' + todoItem.author + ')' : '')}\n`;
        }

    }

    messageResponseEmbed.fields[0].value += "```";

    return {embeds: [messageResponseEmbed]};
}

function removeTodo(channelId, todoNumber){
    const filePath = getFilePath(channelId);
    const fileTodoItems = fs.readFile(filePath);

    const filteredTodoItems = fileTodoItems.todo.filter(todoItem =>{
        return todoItem.count != todoNumber;
    });
    
    //FIXME check if there are any items to remove

    saveTodoList(channelId, filteredTodoItems);
    
    let messageResponse = `Todo item #${todoNumber} removed successfully! Use '?todo' to see the current todo list of this channel.`;

    return messageResponse;
}

function createTodoFile(){

}

exports.onTodoCommand = (client, Events) =>{
    client.on(Events.MessageCreate, msg =>{
        // check if message was sent by the bot
        if (msg.author.id === client.user.id) return;

        // check if message has prefix
        if (!msg.content.startsWith(prefix)) return;

        // check if user has the "staff" role (bmc)
        if (!msg.member.roles.cache.has(requiredRole)) return;

        const channelId = msg.channel.id;
        const filePath = getFilePath(channelId);
        const dirName = files.mainPath;

        // check if folder exists
        if (!fs.fileExists(filePath)){
            fs.makeDir(dirName);

            const todoList = new TodoList();
            let jsonTodoList = JSON.stringify(todoList, null, 2);

            fs.saveFile(filePath, jsonTodoList);
        }

        let command = msg.content.split(prefix)[1];
        let messageContent;
        let response;
        const channelName = msg.channel.name;

        // decide which task to perform based on characters after the prefix
        switch (true){
            // starts with "remove", following 1 or more whitespace, following a digit
            case command.search(/^(remove|r|rem)\s+\d/) != -1:
                let removeNumber = command.split(/(\d+)/)[1];

                response = removeTodo(channelId, removeNumber);
                break;

            // starts with 1 or more whitespace at the start, following 1 or more non-whitespace characters
            case command.search(/^\s+\S+/) != -1:
                messageContent = command.split(/^\s+/)[1];
                let messageAuthor = msg.author.username;

                response = newTodo(channelId, messageContent, messageAuthor);
                break;
            
            default:
                response = displayTodo(channelId, channelName);
                break;
        }

        if (!response)
            return;
            
        msg.reply(response);
    })    
}