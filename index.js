const express = require('express');
const mongoose = require('mongoose');
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP,MONGO_PORT, REDIS_PORT, REDIS_URL, SESSION_SECRET } = require("./config/config");
const session = require('express-session');
const cors = require("cors");
// const RedisStore = require('connect-redis').default;

// const redis = require("redis");

// let redisClient = redis.createClient({
//     host: REDIS_URL,
//     port: REDIS_PORT
// });

// let redisStore = new RedisStore({
//     client: redisClient
// })

const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes');

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false
    })
        .then(() => console.log("successfully connected to DB"))
        .catch((e) => {
            console.log(e);
            setTimeout(connectWithRetry, 5000);
        })
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}));
app.use(session({
    // store: redisStore,
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 60000
    }
}))
app.use(express.json());

app.get('/api/v1', (req, res) => {
    res.send("<h2>Hi There</h2>");
    console.log("request retrieved");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));