const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now()
        },
        commentedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
})

const Post = mongoose.model('Posts', postSchema);
module.exports = Post