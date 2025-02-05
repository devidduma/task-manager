const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');
const { List, Task, User } = require('./db/models');

/* MIDDLEWARE */

// Load middleware
app.use(bodyParser.json());

// Enable CORS Headers
// https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the Refresh Token from the request header
    let refreshToken = req.header("x-refresh-token");

    // grab the _id from the request header
    let _id = req.header("_id");

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if(!user) {
            // User could not be found
            return Promise.reject({
                'error': 'User not found. Make sure the Refresh Token and User Id are correct.'
            });
        }

        // User was found
        // therefore, Session is valid and Refresh Token exists in the database
        // we still have to check if it has expired or not
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if(session.token === refreshToken) {
                // check if the session has expired
                if(User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // Refresh Token has not expired
                    isSessionValid = true;
                }
            }
        });

        if(isSessionValid) {
            // Session is valid, call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh Token has expired or the session is invalid.',
            });
        }
    }).catch((err) => {
        res.status(401).send(err);
    });
}


/**
 * GET /lists
 * Purpose: Get all lists
 */
app.get("/lists", (req, res) => {
    List.find({}).then((list) => {
        res.send(list);
    });
});

/**
 * POST /lists
 * Purpose: Create a list
 */
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

/**
 * PATCH /lists/:id
 * Purpose: Update a specified list
 */
app.patch("/lists/:id", (req, res) => {
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

/**
 * DELETE /lists/:id
 * Purpose: Delete a list
 */
app.delete("/lists/:id", (req, res) => {
    List.findOneAndDelete({
        _id: req.params.id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
    });
});

/**
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks in a specific list
 */
app.get("/lists/:listId/tasks", (req, res) => {
    Task.find({
        listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    });
});

/**
 * PATCH /lists/:listId/tasks/:taskId
 * Purpose: Update an existing task
 */
app.get("/lists/:listId/tasks/:taskId", (req, res) => {
    Task.findOne({
        _id: req.params.taskId,
        listId: req.params.listId
    }).then((task) => {
        res.send(task);
    });
});

/**
 * POST /lists/:listId/tasks
 * Purpose: Create a new task in a specific list
 */
app.post("/lists/:listId/tasks", (req, res) => {
    let newTask = new Task({
        title: req.body.title,
        listId: req.params.listId
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    });
});

/**
 * PATCH /lists/:listId/tasks/:taskId
 * Purpose: Update an existing task
 */
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({
        _id: req.params.taskId,
        listId: req.params.listId
    }, {
        $set: req.body
    }).then(() => {
        res.send({ message: "Updated successfully!" });
    });
});

/**
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: Delete a task
 */
app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndDelete({
        _id: req.params.taskId,
        listId: req.params.listId
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    });
});

/* USER ROUTES */

/**
 * POST /users
 * Purpose: Sign up
 */
app.post('/users', (req, res) => {
    // User sign up
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session has been created successfully - Refresh Token returned
        // Now generate Access Authentication Token for user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // Access Authentication Token generated successfully - return object containing the Authentication Tokens
            return { accessToken, refreshToken };
        });
    }).then((authTokens) => {
        res
            .header("x-refresh-token", authTokens.refreshToken)
            .header("x-access-token", authTokens.accessToken)
            .send(newUser);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session has been created successfully - Refresh Token returned
            // Now generate Access Authentication Token for user

            return user.generateAccessAuthToken().then((accessToken) => {
                // Access Authentication Token generated successfully - return object containing the Authentication Tokens
                return { accessToken, refreshToken };
            });
        }).then((authTokens) => {
            res
                .header("x-refresh-token", authTokens.refreshToken)
                .header("x-access-token", authTokens.accessToken)
                .send(user);
        });
    }).catch((err) => {
        res.status(400).send(err);
    });
});

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get("/users/me/access-token", verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user._id and User Object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((err) => {
        res.status(400).send(err);
    });
});

/* START SERVER */

app.listen(3000, () => {
    console.log("Server is listening on port 3000.");
});
