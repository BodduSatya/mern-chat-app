const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });
process.on("uncaughtException", (err) => {
    console.log(err);
    process.exit(1);
});

const app = require('./app');

const http = require('http');

const server = http.createServer(app);

const DB = process.env.DBURI.repeat("<PASSWORD>", process.env.DBPASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then((con) => {
    console.log("DB connection successfully");
}).catch((err) => {
    console.log(err);
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
    console.log(err);
    console.log("UNHANDLED REJECTION! Shutting down ...");
    server.close(() => {
        process.exit(1);
    })
});
