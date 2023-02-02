import { Schema, model } from 'mongoose';

const MessagesSchema = new Schema({
    author: {type: String, require:true, max:20},
    text: {type: String, require:true},
    timestamp: {type: Date}
});

const MessagesModelMongoDB = model('mensajes', MessagesSchema)

export default MessagesModelMongoDB