import { Room, User } from '../types';

class Channel {
    users: Array<User> = [];
    channels: Array<Room> = [];

    userExists(id: string) {
        return this.getUser(id) !== undefined;
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

    addUser(user: User) {
        if (!this.userExists(user.id)) {
            this.users.push(user);
        }
    }

    removeUser(id: string) {
        this.users = this.users.filter(u => u.id !== id);
    }

    getUser(id: string) {
        return this.users.find(u => u.id === id);
    }
}

export default Channel;