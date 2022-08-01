import { Room, User } from '../types';
import { redisSession } from "../database/redis.db";
class Channel {
    users: Array<object> = [];
    channels: Array<Room> = [];

    channelExists(name: string) {
        return this.getChannel(name) !== undefined;
    }

    addChannel(channel: Room) {
        if (!this.channelExists(channel.name)) {
            this.channels.push(channel);
        }
    }

    getChannel(name: string) {
        return this.channels.find(c => c.name === name);
    }

    async allUsers() {
        this.users = (await redisSession.findAllSessions()).map(session => User.fromSession(session));
        return this.users;
    }

    async addUser(user: User) {
        await redisSession.saveSession(user.sessionID, user.toJSON());
        await this.allUsers();
    }

    async removeUser(id: string) {
        await redisSession.removeSession(id);
        await this.allUsers();
    }

    async getUser(id: string) {
        const session = await redisSession.findSession(id);
        if (session) {
            return User.fromSession(session);
        }
        return undefined;
    }
}

export default Channel;