import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { Server } from "socket.io";
import { Payload } from "../types";
import Channel from ".";
const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();
import axios from "axios";

class SocketChannel extends Channel {
    io: any;
    channel: string;
    socket: any;
    broadcastAuthUrl: string;

    constructor(server, broadcastAuthUrl: "http://localhost:8000//broadcasting/authorize") {
        super();
        this.broadcastAuthUrl = broadcastAuthUrl;

        this.io = new Server(server, { /* options */ });

        Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
            this.io.adapter(createAdapter(pubClient, subClient));
            this.io.on('connection', this.__connection.bind(this));
        }).catch((error) => {
            this.__error(error);
        });
    }

    __connection(socket) {
        this.socket = socket;
        socket.on('disconnect', this.__disconnect.bind(this, socket));
        socket.on('error', this.__error.bind(this));
        socket.on('subscribe', this.__subscribe.bind(this));

        // listen to the dynamic event
        socket.on('whisper', this.__whispers.bind(this));
        socket.on('speak', this.__speaks.bind(this));
    }

    __whispers(payload: Payload) {
        if (payload.channel === this.channel) {
            this.__broadcast('whisper', payload);
        } else {
            this.__broadcastTo('whisper', payload, payload.channel);
        }
    }

    __speaks(payload: Payload) {
        if (payload.channel === this.channel) {
            this.__emit(payload.type, payload.payload);
        } else {
            this.__emitTo(payload.type, payload.payload, payload.channel);
        }
    }

    __emit(event, data) {
        this.io.emit(event, data);
    }

    __emitTo(event, data, channel) {
        this.io.to(channel).emit(event, data);
    }

    __subscribe(payload) {
        if (payload.channel) {
            this.addUser({ id: this.socket.id, name: payload.name ?? this.socket.id, address: this.socket.handshake.address });
            this.addChannel({ name: payload.channel });
            this.socket.join(payload.channel);
            axios.post(this.broadcastAuthUrl, {
                channel_name: payload.channel,
                socket_id: this.socket.id
            }).then((response) => {
                this.addChannel({ name: `private-${payload.channel}` });
                this.socket.join(`private-${payload.channel}`);
            }).catch((err) => {
                console.log(err);
            })
        }
    }

    __disconnect(socket) {
        this.removeUser(socket.id);
        this.users = this.users.filter((user) => {
            return user !== socket.id;
        });
    }

    __broadcast(event, data) {
        // Broadcast to all users
        this.socket.broadcast.emit(event, data);
    }

    __broadcastTo(event, data, channel) {
        // Broadcast to all users in the specified room
        this.socket.broadcast.to(channel).emit(event, data);
    }

    __error(error) {
        console.log(error);
    }

    __broadcastStatus() {
        this.__emit('users', this.users);
        this.__emit('channels', this.channels);
    }
}

export default SocketChannel;