class User {
    userID: string;
    address: string | null;
    sessionID: string | null;
    connected: boolean;

    constructor(userID: string, address: string | null, sessionID: string | null, connected: boolean = false) {
        this.userID = userID;
        this.address = address;
        this.sessionID = sessionID;
        this.connected = connected;
    }

    static fromSession(session: any) {
        return new User(session.userID, session.address, session.sessionID, session.connected);
    }

    toJSON() {
        return {
            userID: this.userID,
            address: this.address,
            sessionID: this.sessionID,
            connected: this.connected
        };
    }
}

export default User;