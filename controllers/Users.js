const User = require("../models/User");
const bcrypt = require('bcryptjs');
const { default: mongoose } = require("mongoose");
const userSchema = require("../utils/validate_schema");

const addUser = async(req, res) => {
    try {

        const {email, password} = await userSchema.validateAsync(req.body);

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const user = new User(req.body);

        const hashedPassword = await bcrypt.hash(password, 8);

        user.password = hashedPassword;

        await user.save();
        const token = await user.generateAuthToken();
        res.status(200).json({ message: "User successfully created", token });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const authenticate = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "Please check the email and password" });
        }

        const passwordCheck = await bcrypt.compare(req.body.password, user.password);

        if (!passwordCheck) {
            return res.status(404).json({ message: "Please check the email and password" });
        }

        const token = await user.generateAuthToken()
        res.status(200).json({ message: "User successfully logged in", token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const followPerson = async(req, res) => {
    const userToFollowID = req.params.id;
    const userID = req.user._id;

    try {
        const userToFollow = await User.findById(userToFollowID);
        if (!userToFollow) {
            return res.status(400).json({ message: 'User with this ID does not exist' });
        }

        if (userID === userToFollowID) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const userDetails = await User.findById(userID);

        const followingLists = userDetails.following;

        if (followingLists && followingLists.includes(mongoose.Types.ObjectId(userToFollowID))) {
            return res.status(400).json({ message: "You already follow this user." });
        }

        await User.findByIdAndUpdate(userID, { $push: { following: userToFollowID } }, { new: true });

        await User.findByIdAndUpdate(userToFollowID, { $push: { followers: userID } }, { new: true });

        return res.status(200).json({ message: `You started following ${userToFollowID}` });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const unfollowPerson = async(req, res) => {
    const userToUnfollowID = req.params.id;
    const userID = req.user._id;

    try {
        const userToUnFollow = await User.findById(userToUnfollowID);
        if (!userToUnFollow) {
            return res.status(400).json({ message: 'User with this ID does not exist' });
        }

        if (userID === userToUnfollowID) {
            return res.status(400).json({ message: 'Invalid operation' });
        }

        const userDetails = await User.findById(userID);

        const followingLists = userDetails.following;

        if (!followingLists) {
            return res.status(400).json({ message: "You already don't follow this user." });
        }

        if (followingLists && !followingLists.includes(mongoose.Types.ObjectId(userToUnfollowID))) {
            return res.status(400).json({ message: "You don't follow this user." });
        }

        await User.findByIdAndUpdate(userID, { $pull: { following: userToUnfollowID } }, { new: true });

        await User.findByIdAndUpdate(userToUnfollowID, { $pull: { followers: userID } }, { new: true }).populate('following', '_id').populate('followers', '_id');

        return res.status(200).json({ message: `You unfollowed ${userToUnfollowID}` });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getUser = async(req, res) => {
    const userID = req.user._id;
    try {
        const userDetails = await User.findOne({ _id: userID });

        const {email, followers, following} = userDetails;

        const userData = {
            email,
            No_Of_Followers: followers.length,
            No_of_Followings: following.length
        }

        return res.status(200).json({ userData });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    addUser,
    authenticate,
    followPerson,
    unfollowPerson,
    getUser
}