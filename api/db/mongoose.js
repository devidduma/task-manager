// This file will handle connection logic to mongoDB database

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/TaskManager', { useNewUrlParser: true }).then(() => {
    console.log('MongoDB Connected!');
}).catch((err) => {
    console.log('Error while attempting to connect to mongoDB.');
    console.log(err);
});

// To prevent deprecation warnings
// mongoose.set('useCreateIndex', true);
// mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose
};
