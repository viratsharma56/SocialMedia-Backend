const { default: mongoose } = require("mongoose");
const Post = require("../models/Post");

const createPost = async(req, res) => {
    const userID = req.user._id;
    const post = new Post({
        title: req.body.title,
        caption: req.body.caption,
        author: userID
    })

    try {
        await post.save();
        const {title, description, createdAt, _id} = post;
        const postData = {
            postID: _id,
            title,
            description,
            createdTime: createdAt
        }
        res.status(201).json({ postData});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deletePost = async(req, res) => {
    const postId = req.params.id;
    const userID = req.user._id;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "No post found with this ID." })
        }

        const postOwner = post.author.toString();

        if (postOwner == userID.toString()) {
            await Post.deleteOne({ _id: postId });

            return res.status(200).json({ message: "Post successfully deleted." });
        }

        return res.status(404).json({ message: "You don't have rights to delete this post" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const likePost = async(req, res) => {
    const postId = req.params.id;
    const userID = req.user._id;
    try {

        const postDetails = await Post.findById(postId);

        const postLikes = postDetails.likes;

        if (postLikes && postLikes.includes(mongoose.Types.ObjectId(userID))) {
            return res.status(404).json({ message: "Post is already liked by you." })
        }

        await Post.findByIdAndUpdate(postId, { $push: { likes: userID } }, { new: true });

        res.status(200).json({ message: "Post liked by you." })
    } catch (error) {
        res.status(500).json("Not able to like the post")
    }
}

const unlikePost = async(req, res) => {
    const postId = req.params.id;
    const userID = req.user._id;
    try {

        const postDetails = await Post.findById(postId);

        const postLikes = postDetails.likes;

        if (!postLikes) {
            return res.status(404).json({ message: "Invalid operation" })
        }

        if (postLikes && !postLikes.includes(mongoose.Types.ObjectId(userID))) {
            return res.status(404).json({ message: "Post is never liked by you." })
        }

        await Post.findByIdAndUpdate(postId, { $pull: { likes: userID } }, { new: true });

        res.status(200).json({ message: "Post is disliked by you." })
    } catch (error) {
        res.status(500).json("Not able to dislikes the post")
    }
}

const commentPost = async(req, res) => {
    const postId = req.params.id;
    const userID = req.user._id;
    const comment = req.body.comment;

    if (!comment) {
        return res.status(404).json({ message: "Comment cannot be empty" })
    }

    try {
        const post = await Post.findOne({_id: postId}).exec();
        if (!post) {
            return res.status(404).json({ message: 'No post exist with this id' })
        }

        await Post.findByIdAndUpdate(postId, { $push: { comments: { comment, commentedBy: userID } } }, { new: true });

        return res.status(200).json({ commentId: post.comments.at(-1)._id})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getPostByID = async(req, res) => {
    const postId = req.params.id;

    try {
        const post = await Post.findById(postId).exec();
        if (!post) {
            return res.status(400).json({ error: 'No post found with this id' })
        }

        const { likes, comments, title, caption } = post;

        const postData = {
            title,
            caption,
            No_of_likes: likes.length,
            No_of_comments: comments.length
        }

        res.status(200).json({ postData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllPosts = async(req, res) => {
    const userID = req.user._id;
    try {
        const allPosts = await Post.find({ author: userID });
        let allPostsData = [];

        allPosts.forEach(post => {
            const {title, caption, createdAt, comments, likes, _id } = post;
            const postData = {
                ID: _id,
                title,
                caption,
                created_at: createdAt,
                No_of_comments: comments.length,
                comments,
                No_of_likes: likes.length
            }

            allPostsData.push(postData);
        })

        res.status(200).json({ allPostsData });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    createPost,
    deletePost,
    likePost,
    unlikePost,
    commentPost,
    getPostByID,
    getAllPosts
}