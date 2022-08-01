
import { Server } from "socket.io";
import { Payload, User } from "../types";
import Channel from ".";
import { adapter, redisSession } from "../database/redis.db";
import AuthMiddleware from "../middlewares/auth.middleware";

class SocketChannel extends Channel {
    io: any;
    channel: string;
    socket: any;
    broadcastAuthUrl: string;

    constructor(server, broadcastAuthUrl: string = "http://localhost:8000/broadcasting/authorize") {
        super();
        this.broadcastAuthUrl = broadcastAuthUrl;

        this.io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'OPTIONS'],
                allowedHeaders: ['Authorization'],
                credentials: true,
            },
        });

        this.io.use(AuthMiddleware);

        adapter(async (adapter) => {
            if (adapter instanceof Error) {
                console.error(adapter);
            } else {
                this.io.adapter(adapter);
                this.io.on('connection', this.__connection.bind(this));
            }
        });

        // setupWorker(this.io);
    }

    async __connection(socket) {
        this.socket = socket;

        const user: User = User.fromSession({ userID: socket.userID, address: socket.address, sessionID: socket.sessionID, connected: true })
        await redisSession.saveSession(socket.sessionID, user)
        socket.broadcast.emit("user:connected", user.toJSON());
        socket.join(socket.userID);

        socket.on('disconnect', this.__disconnect.bind(this));
        socket.on('error', this.__error.bind(this));
        socket.on('subscribe', this.__subscribe.bind(this, user));

        socket.on('whisper', this.__whispers.bind(this));
        socket.on('speak', this.__speaks.bind(this));
    }

    async __whispers(payload: Payload) {
        if (payload.channel === this.channel) {
            this.__broadcast('whisper', payload);
        } else {
            this.__broadcastTo('whisper', payload, payload.channel);
        }
    }

    async __speaks(payload: Payload) {
        if (payload.channel === this.channel) {
            this.__emit(payload.type, payload.payload);
        } else {
            this.__emitTo(payload.type, payload.payload, payload.channel);
        }
    }

    async __emit(event, data) {
        this.io.emit(event, data);
    }

    async __emitTo(event, data, channel) {
        this.io.to(channel).emit(event, data);
    }

    async __subscribe(payload, user, callback) {
        if (payload.channel) {
            this.addChannel({ name: payload.channel });
            this.socket.join(payload.channel);

            this.socket.emit('users', this.users);
            this.socket.emit('user:subscribed', user);

            callback({
                status: 'success',
            });
            // axios.post(this.broadcastAuthUrl, {
            //     channel_name: payload.channel,
            //     socket_id: this.socket.id
            // }).then((response) => {
            //     this.addChannel({ name: `private-${payload.channel}` });
            //     this.socket.join(`private-${payload.channel}`);
            // }).catch((err) => {
            //     console.info("broadcast auth server does not exists...")
            // })
        }
    }

    async __disconnect(socket) {
        const matchingSockets = await this.io.in(socket.userID).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            const user: User = User.fromSession({ userID: socket.userID, address: socket.address, sessionID: socket.sessionID, connected: false })
            // update the connection status of the session
            await redisSession.saveSession(socket.sessionID, user)
            // notify other users
            this.socket.broadcast.emit('user:disconnected', user.toJSON());
        }
    }

    async __broadcast(event, data) {
        // Broadcast to all users
        this.socket.broadcast.emit(event, data);
    }

    async __broadcastTo(event, data, channel) {
        // Broadcast to all users in the specified room
        this.socket.broadcast.to(channel).emit(event, data);
    }

    async __error(error, callback) {
        console.log(error);
        callback({
            status: 'error',
        });
    }

    async __broadcastStatus() {
        this.__emit('all:users', this.users);
        this.__emit('all:channels', this.channels);
    }
}

export default SocketChannel;