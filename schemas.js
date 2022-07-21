const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');   //it will not let us add html tags

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

//joi helps us to validate our form data before we actually save it to our database and if any error is there then it is thrown 
module.exports.restaurantSchema = Joi.object({
    restaurant: Joi.object({       //here in req.body we have restaurant object in which all title,location and description are grouped together so when we pass our req.body for validation joi will first look for restaurant object in it because while filling form name we gave it as restaurant[field_name]
        title: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()   //yeh required nhi hai kyunki jab create karenge tab nhi hoga edit ke wakt hoskta hai
});

//review
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})