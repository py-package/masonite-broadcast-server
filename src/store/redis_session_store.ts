/* abstract */ class SessionStore {
    findSession(id) { }
    saveSession(id, session) { }
    findAllSessions() { }
}

const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([userID, address, connected]) =>
    userID ? { userID, address, connected: connected === "true" } : undefined;

class RedisSessionStore extends SessionStore {
    client: any = undefined;

    constructor(redisClient) {
        super();
        this.client = redisClient;
    }

    findSession(id) {
        return this.client
            .hmget(`mbroadcast:users:${id}`, "userID", "address", "sessionID", "connected")
            .then(mapSession);
    }

    saveSession(id, { userID, address, sessionID, connected }) {
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
                "connected",
                connected
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
            commands.push(["hmget", key, "userID", "address", "sessionId", "connected"]);
        });
        return this.client
            .multi(commands)
            .exec()
            .then((results) => {
                console.log(results);
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