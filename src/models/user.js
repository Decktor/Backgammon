const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        maxlength: 10
    },
    password: {
        type: String,
        required: true,
        minlength: [4, 'Password is too short, shoule be at least 4 characters'],
        trim: true,
        validate(password) {
            if (password.toLowerCase().includes("password")) {
                throw new Error("The password can't contain the word 'password'")
            }
        }
        
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not a valid email address')
            }
        }
    },
    rank: {
        type: Number,
        default: 1000
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
}, {
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({email})
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.statics.verifyToken = async (name ,token) => {
    try {
        const user = await User.findOne({name})
        if (!user.tokens) {
            throw new Error('Unable to login')
        }
        let usertoken = user.tokens.find(element => element.token === token)
        if (!usertoken) {
            throw new Error('Unable to login')
        }
        return user
    } catch (e) {
        throw new Error('Authentication error', e)
    }
}

userSchema.statics.updateRank = async (name ,token, score) => {
    try {
        const user = await User.findOne({name})
        if (!user.tokens) {
            throw new Error('Unable to login')
        }
        let usertoken = user.tokens.find(element => element.token === token)
        if (!usertoken) {
            throw new Error('Unable to login')
        }
        user.rank += score
        if (user.rank < 0) {
            user.rank = 0
        }
        await user.save()
        return user
    } catch (e) {
        throw new Error('Authentication error', e)
    }
}


// Hash the plain text paswsord before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User