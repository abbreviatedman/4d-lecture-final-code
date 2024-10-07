const bcrypt = require('bcrypt');
const User = require('../../models/userModel');

const createUser = async function (userInfo) {
    try {
        const salt = await bcrypt.genSalt(13);
        const encryptedPassword = await bcrypt.hash(userInfo.password, salt);
        const newUserData = {
            username: userInfo.username,
            password: encryptedPassword,
            favoritePokemon: [],
        }

        const databaseUser = await User.create(newUserData);

        return databaseUser;
    } catch (error) {
        throw error;
    }
}

const getUsers = async function () {
    try {
        const users = await User.find({});

        return users;
    } catch (error) {
        throw error;
    }
}

const loginUser = async function (userData) {
    try {
        const foundUser = await User.findOne({ username: userData.username });
        if (!foundUser) {
            // if there's no user by that username:
            return 'No user by that username.';
        }

        // compare the incoming password to the database password for that user
        // if it matches, return true
        // otherwise, return false
        const isCorrectPassword = bcrypt.compare(userData.password, foundUser.password);

        return isCorrectPassword;
    } catch (error) {
        throw error;
    }
}

const addFavoritePokemonToUser = async function (userId, pokemonId) {
    try {
        const currentUser = await User.findById(userId);
        currentUser.favoritePokemon.push(pokemonId);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {favoritePokemon: currentUser.favoritePokemon},
            {new: true}
        )

        return updatedUser;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createUser,
    getUsers,
    loginUser,
    addFavoritePokemonToUser,
}