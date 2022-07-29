
import { Server } from "socket.io";
import { Payload } from "../types";
import Channel from ".";
import redisDB from "../database/redis.db";

class SocketChannel extends Channel {
    io: any;
    channel: string;
    socket: any;
    broadcastAuthUrl: string;

    constructor(server, broadcastAuthUrl: string = "http://localhost:8000/broadcasting/authorize") {
        super();
        this.broadcastAuthUrl = broadcastAuthUrl;

        this.io = new Server(server, { /* options */ });

        redisDB.adapter(async (adapter) => {
            if (adapter instanceof Error) {
                console.error(adapter);
            } else {
                this.io.adapter(adapter);
                this.io.on('connection', this.__connection.bind(this));
            }
        });
    }

    async __connection(socket) {
        this.socket = socket;
        socket.on('disconnect', this.__disconnect.bind(this, socket));
        socket.on('error', this.__error.bind(this));
        socket.on('subscribe', this.__subscribe.bind(this));

        // listen to the dynamic event
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

    async __subscribe(payload) {
        if (payload.channel) {
            await this.getUsers();
            await this.addUser({ id: this.socket.id, name: payload.name ?? this.socket.id, address: this.socket.handshake.address });
            this.addChannel({ name: payload.channel });
            this.socket.join(payload.channel);
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
        this.removeUser(socket.id);
        this.getUsers();
    }

    async __broadcast(event, data) {
        // Broadcast to all users
        this.socket.broadcast.emit(event, data);
    }

    async __broadcastTo(event, data, channel) {
        // Broadcast to all users in the specified room
        this.socket.broadcast.to(channel).emit(event, data);
    }

    async __error(error) {
        console.log(error);
    }

    async __broadcastStatus() {
        this.__emit('users', this.users);
        this.__emit('channels', this.channels);
    }
}

export default SocketChannel;