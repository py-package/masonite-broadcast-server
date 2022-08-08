class User {
    userID: string;
    address: string | null;
    sessionID: string | null;
    socketID: string | null;
    connected: boolean;
    extra: any;

    constructor(userID: string, address: string | null, sessionID: string | null, socketID: string | null, connected: boolean = false, extra: any) {
        this.userID = userID;
        this.address = address;
        this.sessionID = sessionID;
        this.socketID = socketID;
        this.connected = connected;
        this.extra = extra;
    }

    static fromSession(session: any) {
        return new User(session.userID, session.address, session.sessionID, session.socketID, session.connected, session.extra);
    }

    toJSON() {
        return {
            userID: this.userID,
            address: this.address,
            sessionID: this.sessionID,
            socketID: this.socketID,
            connected: this.connected,
            extra: this.extra,
        };
    }
}

export default User;
