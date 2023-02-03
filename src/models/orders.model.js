import { Schema, model } from 'mongoose';

const OrdersSchema = new Schema({
    username: {type: String, require:true, max:20},
    email: {type: String, require:true, max:50},
    order: {type: Array, required: true},
    delivered: {type: Boolean, required: true},
    timestamp: {type: Date}
});

const OrdersModelMongoDB = model('mensajes', OrdersSchema)

export default OrdersModelMongoDB