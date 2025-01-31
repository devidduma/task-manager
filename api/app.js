const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');
const { List, Task } = require('./db/models');

// Load middleware
app.use(bodyParser.json());

// Enable CORS Headers
// https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Get all lists
app.get("/lists", (req, res) => {
    List.find({}).then((list) => {
        res.send(list);
    });
});

// Create a list
app.post("/lists", (req, res) => {
    let title = req.body.title;

    let newList = new List({
        title
    });
    newList.save().then((listDoc) => {
        // The full list document is returned
        res.send(listDoc);
    });
});

// Update a specified list with id
app.patch("/lists/:id", (req, res) => {
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

// Delete a list with id
app.delete("/lists/:id", (req, res) => {
    List.findOneAndDelete({
        _id: req.params.id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
    });
});

// Get all tasks in a specific list with listId
app.get("/lists/:listId/tasks", (req, res) => {
    Task.find({
        listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    });
});

// Return task with taskId and listId
app.get("/lists/:listId/tasks/:taskId", (req, res) => {
    Task.findOne({
        _id: req.params.taskId,
        listId: req.params.listId
    }).then((task) => {
        res.send(task);
    });
});

// Create a new task in a specific list with listId
app.post("/lists/:listId/tasks", (req, res) => {
    let newTask = new Task({
        title: req.body.title,
        listId: req.params.listId
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    });
});

// Update task with taskId in a specific list with listId
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({
        _id: req.params.taskId,
        listId: req.params.listId
    }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndDelete({
        _id: req.params.taskId,
        listId: req.params.listId
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    });
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000.");
});
