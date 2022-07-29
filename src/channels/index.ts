import { Room, User } from '../types';
import redisDB from "../database/redis.db";
class Channel {
    users: Array<User> = [];
    channels: Array<Room> = [];

    async userExists(id: string) {
        return await this.getUser(`mbroadcast_users:${id}`) !== undefined;
    }

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

    async getUsers() {
        const userIds = await redisDB.client.keys('mbroadcast_users:*');
        this.users = await Promise.all(userIds.map(id => this.getUser(id)));
        return this.users;
    }

    async addUser(user: User) {
        if (!await this.userExists(user.id)) {
            await redisDB.client.set(`mbroadcast_users:${user.id}`, JSON.stringify(user));
        }
    }

    async removeUser(id: string) {
        await redisDB.client.del(`mbroadcast_users:${id}`);
    }

    async getUser(id: string) {
        const user = await redisDB.client.get(id);
        if (user) {
            return JSON.parse(user);
        }
        return undefined;
    }
}

export default Channel;