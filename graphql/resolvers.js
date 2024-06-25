const validator = require("validator");

const User = require('../models/user');

module.exports = {
    hello() {
        return {
            text: 'Hello World!',
            views: 1234
        }
    },

    createUser: async function(args, req) {
        let errors = []
        if (!validator.isEmail(args.userInput.email)) {
            errors.push({message: 'Email is invalid'})
        }

        if (validator.isEmpty(args.userInput.password) || !validator.isLength(args.userInput.password, {min: 5})) {
            errors.push({message: 'Password too short'})
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input')
            error.data = errors
            error.code = 422
            throw error
        }

        const email = args.userInput.email;
        const name = args.userInput.name;
        const password = args.userInput.password;

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            const error = new Error('User exists already!');
            throw error;
        }

        const user = new User({
            email: email,
            name: name,
            password: password
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() };
    },

    deleteUser: async function(args, req) {
        userId = args.userId;

        const res = await User.findByIdAndDelete(userId);
        return res;
    }
}