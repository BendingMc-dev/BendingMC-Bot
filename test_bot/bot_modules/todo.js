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

    // console.log("Message has todo item. Saving todo in file"); //DEBUG

    // const todoList = new TodoList();

    // for (let fileTodoItem of fileTodoItems.todo){
    //     const todoItem = new TodoItem(fileTodoItem.count, fileTodoItem.content);

    //     todoList.todoList.push(todoItem);
    // }

    let todoListCount = fileTodoItems.todo.length + 1;
    // const todoItem = new TodoItem(todoListCount, messageContent);

    // todoList.todoList.push(todoItem);

    // const jsonTodoList = JSON.stringify(todoList, null, 2);

    // fs.saveFile(filePath, jsonTodoList);
    const todoItem = new TodoItem(todoListCount, messageContent, messageAuthor);
    fileTodoItems.todo.push(todoItem);

    saveTodoList(channelId, fileTodoItems.todo);

    let messageResponse = `Todo item #${todoItem.count} added successfully! Use '?todo' to see the current todo list of this channel.`;
    
    return messageResponse;
}

function displayTodo(channelId, channelName){
    const filePath = getFilePath(channelId);
    const fileTodoItems = fs.readFile(filePath);

    // console.log("Message does not have todo item. Displaying todo list of channel"); //DEBUG
    // for (let todoItem of fileTodoItems.todo){
    //     console.log("Todo item of channel: " + todoItem.count + " -> " + todoItem.content);
    // }

    // let messageResponse = `WIP. Displaying todo item of channel:\n`;
    const messageResponseEmbed = {
        color: 0xFB4E88,
        // title: '',
        // url: '', //'https://discord.js.org',
        author: {
            name: `Channel Todo List | `, //'Some name',
            icon_url: 'https:\/\/www.dropbox.com\/temp_thumb_from_token\/s\/u5ajixq3x3ubmsp?preserve_transparency=False&size=1200x1200&size_mode=4',
            // url: '', //'https://discord.js.org',
        },
        description: '```markdown\n' + channelName + '\n```', //'Some description here',
        fields: [
            {
                name: '',
                value: '```markdown\n',
            },
        ],
        // image: {
        //     url: '', //'https://i.imgur.com/AfFp7pu.png',
        // },
        footer: {
            text: '', //'Some footer text here',
            icon_url: '', //'https://i.imgur.com/AfFp7pu.png',
        },
    };

    //FIXME add limit (if the next item + the current items length is more than 1000, create a new field and start adding there instead)
    for (let todoItem of fileTodoItems.todo){
        let capitalizedTodoItemContent = todoItem.content.charAt(0).toUpperCase() + todoItem.content.slice(1);

        messageResponseEmbed.fields[0].value +=  `${todoItem.count}. ${capitalizedTodoItemContent} ${(todoItem.author ? '(<@' + todoItem.author + '>)' : '')}\n`;
    }

    messageResponseEmbed.fields[0].value += "```";

    // console.log("Message response to displayTodo command: " + messageResponse); //DEBUG
    return {embeds: [messageResponseEmbed]};
}

function removeTodo(channelId, todoNumber){
    const filePath = getFilePath(channelId);
    const fileTodoItems = fs.readFile(filePath);

    const filteredTodoItems = fileTodoItems.todo.filter(todoItem =>{
        // console.log(`Filtering items... Count of todoItem (${todoItem.count}) and number of item to be removed ${todoNumber}`); //DEBUG
        return todoItem.count != todoNumber;
    });

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

        if (!msg.member.roles.cache.has(requiredRole)) return;

        console.log("--------- Start of Log ---------"); //DEBUG

        const channelId = msg.channel.id;
        const filePath = getFilePath(channelId);
        const dirName = files.mainPath;

        // check if folder exists
        if (!fs.fileExists(filePath)){
            fs.makeDir(dirName);

            const todoList = new TodoList();
            let jsonTodoList = JSON.stringify(todoList, null, 2);
            // console.log("New file created with the json: " + jsonTodoList); //DEBUG

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
                let messageAuthor = msg.author.id;

                response = newTodo(channelId, messageContent, messageAuthor);
                break;
            
            default:
                response = displayTodo(channelId, channelName);
                break;
        }

        if (!response)
            return;
            
        msg.reply(response);

        // check if message exists
        // let messageContent = (msg.content.split(prefix + " ")[1] === undefined ? msg.content.split(prefix)[1] : msg.content.split(prefix + " ")[1]);

        // const fileTodoItems = fs.readFile(filePath);

        // if (messageContent){
        //     newTodo(fileTodoItems, messageContent, filePath);
        // } else {
        //     displayTodo(fileTodoItems);
        // }

        console.log("--------- End of Log ---------"); //DEBUG
        console.log(" "); //DEBUG
    })    
}