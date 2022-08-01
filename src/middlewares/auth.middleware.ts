import { client } from "../database/redis.db";
import { randomBytes } from "crypto";
import RedisSessionStore from "../store/redis_session_store";

const sessionStore = new RedisSessionStore(client);

const AuthMiddleware = async (socket, next) => {
    const sessionID = socket.handshake.auth?.sessionID;

    if (sessionID) {
        const session = sessionStore.findSession(sessionID);
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.address = session.address;
            return next();
        }
    }
    socket.sessionID = randomBytes(16).toString("hex");
    socket.userID = randomBytes(8).toString("hex");
    socket.address = socket.handshake.address;
    next();
}

export default AuthMiddleware;