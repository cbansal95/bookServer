import joi, { func } from 'joi';

const idSchema = joi.number().integer().greater(-1).required();
const emailSchema = joi.string().email().required();
const publishedYearSchema = joi.number().integer().greater(-1).required();
const ratingSchema = joi.number().integer().greater(0).less(6).required();
const stringSchema = joi.string().required().min(3).max(255);

const userRegisterSchema = joi.object({
    username: stringSchema,
    email: emailSchema,
    password: stringSchema
});

const decodedUserSchema = joi.object({
    email: emailSchema,
    password: stringSchema
});

const bookSchema = joi.object({
    title: stringSchema,
    author: stringSchema,
    publishedYear: publishedYearSchema
});

const reviewSchema = joi.object({
    bookId: idSchema,
    userId: idSchema,
    rating: ratingSchema,
    comment: stringSchema
});

function validateUserRegisterSchema(body: unknown) {
    const result = userRegisterSchema.validate(body);
    if (result.error) {
        throw new Error("User register schema validation error: " + result.error.message);
    }
}

function validateDecodedUserSchema(body: unknown) {
    const result = decodedUserSchema.validate(body);
    if (result.error) {
        throw new Error("Cookie validation error: " + result.error.message);
    }
}

function validateBookSchema(body: unknown) {
    const result = bookSchema.validate(body);
    if (result.error) {
        throw new Error("Book schema validation error: " + result.error.message);
    }
}

function validateReviewSchema(body: unknown) {
    const result = reviewSchema.validate(body);
    if (result.error) {
        throw new Error("Review schema validation error: " + result.error.message);
    }
}

function validateIdSchema(id: number) {
    const result = idSchema.validate(id);
    if (result.error) {
        throw new Error("Id validation error: " + result.error.message);
    }
}

export { validateUserRegisterSchema, validateDecodedUserSchema, validateBookSchema, validateReviewSchema, validateIdSchema }