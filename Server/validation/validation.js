const Joi = require('joi');

module.exports = {
    validateInsert: validateInsert
}

const schemas = Joi.object().keys({
    name: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required()

})


function validateInsert(req, res, next) {

    console.log(req.body,"111");

    Joi.validate({
        name: req.body.name,
        password: req.body.password,
        role: req.body.role,

    }, schemas, (err, data) => {
        if (err) {
            res.status(400).json(err);
            res.end();
        } else {

            next();
        }

    });
}