
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

        if (this.io === undefined) {
            this.io = new Server(server, {
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST', 'OPTIONS'],
                    allowedHeaders: ['Authorization'],
                    credentials: true,
                },
            });
        }

        this.io.use(AuthMiddleware);

        adapter(async (adapter) => {
            if (adapter instanceof Error) {
                console.error(adapter);
            } else {
                this.io.adapter(adapter);
                this.io.on('connection', this.#connection.bind(this));
            }
        });

        // setupWorker(this.io);
    }

    async #connection(socket) {
        this.socket = socket;

        const user: User = User.fromSession({ userID: socket.userID, address: socket.address, sessionID: socket.sessionID, connected: true })
        this.addUser(user);

        socket.emit('session', user.toJSON());
        socket.emit("user:connected", user.toJSON());
        socket.join(socket.userID);

        socket.on('disconnect', async () => {
            const matchingSockets = await this.io.in(socket.userID).allSockets();
            const isDisconnected = matchingSockets.size === 0;
            if (isDisconnected) {
                const user: User = User.fromSession({ userID: socket.userID, address: socket.address, sessionID: socket.sessionID, connected: false })
                // update the connection status of the session
                this.addUser(user);
                // notify other users
                socket.broadcast.emit('user:disconnected', user.toJSON());
            }
        });

        /** Error */
        socket.on('error', (error, callback) => {
            console.log(error);
            callback({
                status: 'error',
            });
        });

        /** Join/Subscribe */
        socket.on('subscribe', (payload) => {
            if (payload.channel) {
                this.addChannel({ name: payload.channel });
                socket.join(payload.channel);
                socket.emit('users', this.users);
                socket.emit('user:subscribed', user);
                this.#verifyServerAuthentication()
            }
        });

        /** Whisper: send message to other connected users */
        socket.on('whisper', (payload: Payload) => {
            socket.broadcast.to(payload.channel).emit(`whisper:${payload.event}`, payload.data);
        });

        /** Speak: send message to all connected users */
        socket.on('speak', (payload: Payload) => {
            this.io.in(payload.channel).emit(`speak:${payload.event}`, payload.data);
        });

        /** Emit */
        socket.on('emit', (payload: Payload) => {
            this.io.in(payload.channel).emit(payload.event, payload.data);
        })

        /** Broadcast */
        socket.on('broadcast', (payload: Payload) => {
            socket.broadcast.to(payload.channel).emit(payload.event, payload.data);
        })
    }

    #verifyServerAuthentication() {
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

    async #broadcastStatus() {
        this.io.emit('all:users', this.users);
        this.io.emit('all:channels', this.channels);
    }
}

export default SocketChannel;