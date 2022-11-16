const Joi = require('joi');

const userSchema = Joi.object({
    email: Joi.string().email().required().max(50),
    password: Joi.string().required().min(6).max(50)
})

module.exports = userSchema