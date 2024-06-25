const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {createHandler} = require("graphql-http/lib/use/express");
// const { buildSchema } = require("graphql");
const {ruruHTML} = require("ruru/server");

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); // application/json
app.use(
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.all("/graphql", createHandler({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        formatError(err) {
            if (!err.originalError) {
                return err
            }
            const data = err.originalError.data
            const message = err.message || "An error occurred"
            const code = err.originalError.code || 500
            return {message: message, data: data, code: code}
        }
    })
);

app.get("/", (_req, res) => {
    res.type("html")
    res.end(ruruHTML({endpoint: "/graphql"}))
})

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});

mongoose
    .connect(
        'mongodb://localhost:27017/testing'
    )
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err));
