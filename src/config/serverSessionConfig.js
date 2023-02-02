import session from 'express-session';
import connectMongo from 'connect-mongo'
import * as dotenv from 'dotenv'
dotenv.config();

/*=============== Controllers Configuration ===============*/
//Session
const MongoStore = connectMongo.create({
  mongoUrl: process.env.SESSION_MONGO_URL,
  ttl: process.env.SESSION_EXPIRE_TIME,
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
})

const sessionMiddleware = (session({
    store: MongoStore,
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: true
  }))


//SocketSession Info
const wrap = (expressMiddleware) => (socket, next) => {
    expressMiddleware(socket.request, {}, next)
}

export { sessionMiddleware, wrap }