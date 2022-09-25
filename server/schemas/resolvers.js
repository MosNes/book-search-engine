//import auth error handling from Apollo Server
const { AuthenticationError } = require('apollo-server-express');
//import models
const { User } = require('../models');
//import signToken functionality
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        //authenticate a user
        me: async (parent, args, context) => {
            // if request contains a valid user object inside of the context (i.e. the auth middleware succeeded)
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    //DO NOT USE POPULATE ON SUBDOCUMENTS
                    //.populate('savedBooks');
                return userData;
            } else {
                throw new AuthenticationError('Not Logged In');
            }
        },
    },

    Mutation: {
        //create user and sign JWT
        addUser: async (parent, {email, username, password}) => {
            
            //creates new user from provided arguments
            const user = await User.create({ 
                username: username,
                email: email,
                password: password
            });
            //sign new JWT with user's info
            const token = signToken(user);
            return {token, user};
        },

        //user logs in and receives token
        login: async (parent, {email, password}) => {
            //find user using email or username
            const user = await User.findOne({email: email});

            //if username or email is invalid
            if (!user) {
                throw new AuthenticationError('Email or Password is incorrect');
            }

            //checks if provided password matches user's password in the DB
            const correctPw = await user.isCorrectPassword(password);

            //if password is incorrect
            if (!correctPw) {
                throw new AuthenticationError('Email or Password is incorrect');
            }

            //sign new JWT with user's info
            const token = signToken(user);

            return {token, user}
        },

        //add book to user's book list
        saveBook: async (parent, args, context) => {

            //if request contains a valid user object
            if (context.user) {
                //try to update the user's savedBooks array with the new book

                console.log('saveBook args', args);

                try {
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $addToSet: { savedBooks: args.input }},
                        { new: true, runValidators: true }
                    );

                    return updatedUser;
                    //else log error
                } catch (e) {
                    console.log(e);
                }
                //else throw auth error
            } else {
                throw new AuthenticationError('Not Logged In');
            }
        },

        //remove book from user's book list
        removeBook: async (parent, { bookId }, context) => {

            //if request contains a valid user object
            if (context.user) {
                //remove book from savedBooks
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $pull: { savedBooks: { bookId: bookId }}},
                    { new: true }
                )

                return updatedUser;
                //else throw auth error
            } else {
                throw new AuthenticationError('Not Logged In');
            }
        }
    }
}

module.exports = resolvers;