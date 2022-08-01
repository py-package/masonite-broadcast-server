import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import RedisSessionStore from "../store/redis_session_store";

export const client = new Redis({
    port: 6379,
    host: "localhost",
    password: ""
});

export const adapter = (callback) => {
    callback(createAdapter(client, client.duplicate()));
}

export const redisSession = new RedisSessionStore(client);