const mysql = require("../utils/mysql-manager.js");
const fs = require("../utils/json-manager.js");

const prefix = "?todo";

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
    constructor(count, content){
        this.count = count;
        this.content = content;
    }

    toJSON() {
        return  {
            count: this.count,
            content: this.content
        }
    }
}

function getFilePath(channelId){
    return files.mainPath + channelId + ".json";
}

function saveTodoList(todoItems){
    const todoList = new TodoList();

    for (let todoItem of todoItems){
        const item = new TodoItem(todoItem.count, todoItem.content);

        todoList.todoList.push(item);
    }

    let options = null;
    let spacing = 2;
    const jsonTodoList = JSON.stringify(todoList, options, spacing);
    const filePath = getFilePath(channelId);

    fs.saveFile(filePath, jsonTodoList);
}

function newTodo(channelId, messageContent){
    const filePath = getFilePath(channelId);
    const fileTodoItems = fs.readFile(filePath);

    console.log("Message has todo item. Saving todo in file"); //DEBUG

    const todoList = new TodoList();

    for (let fileTodoItem of fileTodoItems.todo){
        const todoItem = new TodoItem(fileTodoItem.count, fileTodoItem.content);

        todoList.todoList.push(todoItem);
    }

    let todoListCount = todoList.todoList.length + 1;
    const todoItem = new TodoItem(todoListCount, messageContent);

    todoList.todoList.push(todoItem);

    const jsonTodoList = JSON.stringify(todoList, null, 2);

    fs.saveFile(filePath, jsonTodoList);

    // FIXME send message response
}

function displayTodo(channelId){
    const filePath = getFilePath(channelId);
    const fileTodoItems = fs.readFile(filePath);

    console.log("Message does not have todo item. Displaying todo list of channel"); //DEBUG
    for (let todoItem of fileTodoItems.todo){
        console.log("Todo item of channel: " + todoItem.count + " -> " + todoItem.content);
    }

    // FIXME display todo in channel
}

function removeTodo(channelId, todoNumber){
    const filePath = getFilePath(channelId);
    const fileTodoItems = fs.readFile(filePath);

    const filteredTodoItems = fileTodoItems.todo.filter(todoItem =>{
        todoItem.count === todoNumber;
    });

    saveTodoList(filteredTodoItems);
    //FIXME send message response
}

function createTodoFile(){

}

exports.onTodoCommand = (client, Events) =>{
    client.on(Events.MessageCreate, msg =>{
        // check if message was sent by the bot
        if (msg.author.id === client.user.id) return;

        // check if message has prefix
        if (!msg.content.startsWith(prefix)) return;

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

        switch (true){
            case command.search(/^(remove|r|rem)\s+\d/) != -1: // starts with "remove", following 1 or more whitespace, following a digit
                let removeNumber = command.split(/(\d+)/)[1]; // extract number of todo to be removed from command

                removeTodo(channelId, removeNumber);
                break;
            case command.search(/^\s+\S+/) != -1: // starts with 1 or more whitespace at the start, following 1 or more non-whitespace characters
                messageContent = command.split(/^\s+/)[1]; // extract content of message from command

                newTodo(channelId, messageContent);
                break;
            default:
                displayTodo(channelId);
                break;
        }

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