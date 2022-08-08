/* abstract */ class SessionStore {
    findSession(id) { }
    saveSession(id, session) { }
    findAllSessions() { }
}

const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([userID, address, sessionID, socketID, connected, extra]) =>
    userID ? { userID, address, sessionID, socketID, connected: connected === "true", extra } : undefined;

class RedisSessionStore extends SessionStore {
    client: any = undefined;

    constructor(redisClient) {
        super();
        this.client = redisClient;
    }

    findSession(id) {
        return this.client
            .hmget(`mbroadcast:users:${id}`, "userID", "address", "sessionID", "socketID", "connected", "extra")
            .then(mapSession);
    }

    saveSession(id, { userID, address, sessionID, socketID, connected, extra }) {
        this.client
            .multi()
            .hset(
                `mbroadcast:users:${id}`,
                "userID",
                userID,
                "address",
                address,
                "sessionID",
                sessionID,
                "socketID",
                socketID,
                "connected",
                connected,
                "extra",
                extra
            )
            .expire(`mbroadcast:users:${id}`, SESSION_TTL)
            .exec();
    }

    async findAllSessions() {
        const keys = new Set();
        let nextIndex = 0;
        do {
            const [nextIndexAsStr, results] = await this.client.scan(
                nextIndex,
                "MATCH",
                "mbroadcast:users:*",
                "COUNT",
                "100"
            );
            nextIndex = parseInt(nextIndexAsStr, 10);
            results.forEach((s) => keys.add(s));
        } while (nextIndex !== 0);
        const commands = [];
        keys.forEach((key) => {
            commands.push(["hmget", key, "userID", "address", "sessionID", "socketID", "connected", "extra"]);
        });
        return this.client
            .multi(commands)
            .exec()
            .then((results) => {
                return results
                    .map(([err, session]) => (err ? undefined : mapSession(session as any)))
                    .filter((v) => !!v);
            });
    }

    async removeSession(id) {
        await this.client.del(`mbroadcast:users:${id}`);
    }
}

export default RedisSessionStore;
