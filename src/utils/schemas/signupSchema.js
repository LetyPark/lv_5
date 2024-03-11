import Joi from 'joi';

const signUpSchema = Joi.object({
    nickname : Joi.string().min(3).max(15).alphanum().required(),
    password: Joi.string()
        .min(8)
        .max(20)
        .pattern(new RegExp(`^(?!.*\\b${Joi.ref('nickname')}\\b).{8,20}$`))
        .required(),
    userType: Joi.string().valid('CUSTOMER', 'OWNER').default('CUSTOMER')
});

export default signUpSchema;