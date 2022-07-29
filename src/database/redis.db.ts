import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

const adapter = (callback) => {
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        callback(createAdapter(pubClient, subClient));
    }).catch((error) => {
        callback(error);
    })
}

const data = {
    client: pubClient,
    adapter,
    publish: (channel: string, data) => {
        pubClient.publish(channel, JSON.stringify(data));
    },
}

export default data;