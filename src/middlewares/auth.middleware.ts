import { client } from "../database/redis.db";
import { randomBytes } from "crypto";
import RedisSessionStore from "../store/redis_session_store";

const sessionStore = new RedisSessionStore(client);

const AuthMiddleware = async (socket, next) => {
    const sessionID = socket.handshake.auth?.sessionID;
    if (sessionID) {
        const session = await sessionStore.findSession(sessionID);
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.address = session.address;
            socket.userExtra = session.extra;
            return next();
        }
    }
    socket.sessionID = randomBytes(16).toString("hex");
    socket.userID = socket.handshake.auth?.userID ?? randomBytes(8).toString("hex");
    socket.address = socket.handshake.address;
    socket.userExtra = undefined;
    next();
}

export default AuthMiddleware;