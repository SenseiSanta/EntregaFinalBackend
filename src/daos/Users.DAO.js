import { ContainerMongoDB } from "../container/ContainerMongoDB.js"
import UsersModelMongoDB from "../models/users.model.js"

export class UsersDAOMongoDB extends ContainerMongoDB {
    constructor() {
        super(UsersModelMongoDB);
    }

    async getUserByUsername(user) {
        try {
            await this.conn.connect();
            const doc = await this.colection.find({username: user});
            if (doc == '') {
                return undefined;
            } else {
                return doc
            }
        }
        catch(error) {
            console.log(error);
        } finally {
            await this.conn.disconnect();
        }
    }
}