const express = require('express');
const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Get all lists
app.get("/lists", (req, res) => {

});

// Create a list
app.post("/lists", (req, res) => {

});

// Update a specified list with id
app.patch("/lists/:id", (req, res) => {

});

// Delete a list with id
app.delete("/lists/:id", (req, res) => {

})

app.listen(3000, () => {
    console.log("Server is listening on port 3000.");
});
