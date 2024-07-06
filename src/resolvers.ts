import jsonwebtoken from 'jsonwebtoken'
import { Context } from './types.js'
import { validateUserRegisterSchema, validateDecodedUserSchema, validateBookSchema, validateReviewSchema, validateIdSchema } from './schemaValidator.js'
import { PrismaClientOptions } from '@prisma/client/runtime/library';


const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const resolvers = {
    Query: {
        getBooks,
        getBook,
        getReviews,
        getMyReviews,
        
    },

    Mutation: {
        login,
        register,
        addBook,
        addReview,
        updateReview,
        deleteReview
    }
}

/**
 * Retrieves a book from the database based on the provided ID.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {number} args.id - The ID of the book to retrieve.
 * @param {Context} context - The context object containing the Prisma client.
 * @return {Promise<Book | null>} A promise that resolves to the retrieved book or null if not found.
 */
function getBook(_parent: unknown, args: { id: number }, context: Context) {
    const id = Number(args.id)
    validateIdSchema(id)
    return context.prisma.book.findUnique({ where: { 'id': id } })
}


/**
 * Retrieves a list of books from the database based on the provided cursor.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {number} [args.cursor] - The cursor value to paginate the results.
 * @param {Context} context - The context object containing the Prisma client.
 * @return {Promise<Array<Book>>} A promise that resolves to an array of books.
 */
function getBooks(_parent: unknown, args: { cursor?: number }, context: Context) {
    const prismaQueryObj: any = {
        orderBy: { 'id': 'asc' },
        take: process.env.PAGE_SIZE || 3
    }
    if (typeof args.cursor === 'number') {
        prismaQueryObj['cursor'] = { 'id': args.cursor }
        prismaQueryObj['skip'] = 1
    }
    return context.prisma.book.findMany(prismaQueryObj)
}

/**
 * Retrieves reviews for a specific book.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {number} args.bookId - The ID of the book to retrieve reviews for.
 * @param {number} [args.cursor] - The cursor value to paginate the results.
 * @param {Context} context - The context object containing the Prisma client.
 * @return {Promise<Review[]>} A promise that resolves to an array of reviews for the specified book.
 */
function getReviews(_parent: unknown, args: { bookId: number, cursor?: number }, context: Context) {
    const bookId = Number(args.bookId)
    validateIdSchema(bookId)
    const prismaQueryObj: any = {
        where: { 'bookId': bookId },
        orderBy: { 'id': 'asc' },
        take: process.env.PAGE_SIZE || 3
    }
    if (typeof args.cursor === 'number') {
        prismaQueryObj['cursor'] = { 'id': args.cursor }
        prismaQueryObj['skip'] = 1
    }
    return context.prisma.review.findMany(prismaQueryObj)
}

/**
 * Logs in a user with the provided email and password.
 * Maintains auth state by generating and JWT and setting it to the cookie.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {string} args.email - The email of the user.
 * @param {string} args.password - The password of the user.
 * @param {Context} context - The context object containing the Prisma client.
 * @return {Promise<Object>} A promise that resolves to an object with the message "User logged in".
 * @throws {Error} If the credentials are invalid.
 */
async function login(_parent: unknown, args: { email: string, password: string }, context: Context) {
    const { email, password } = args
    validateDecodedUserSchema(args)
    const user = await context.prisma.user.findUnique({ where: { "email": email } })
    if (!user || user.password !== password) {
        throw new Error('Invalid credentials')
    }

    const token = jsonwebtoken.sign({"email": user.email, "password": user.password}, JWT_SECRET, { expiresIn: '12h' })
    context.res.setHeader('Set-Cookie', `token=${token};SameSite=None; Secure`,)
    context.res.setHeader('Access-Control-Allow-Credentials', 'true')
    context.res.setHeader('Access-Control-Allow-Origin', 'https://studio.apollographql.com')
    return {"message": "User logged in"}	
}

/**
 * Retrieves reviews for the current user.
 * Requires authentication.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {Context} context - The context object containing the Prisma client.
 * @return {Promise<Review[]>} A promise that resolves to an array of reviews for the current user.
 */
async function getMyReviews(_parent: unknown, args: {  }, context: Context) {
    const { userId } = context
    if(!userId) {
        throw new Error('User not authenticated')
    }
    return context.prisma.review.findMany({ where: { userId } })
}

/**
 * Registers a new user with the given username, email, and password.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {string} args.username - The username of the user.
 * @param {string} args.email - The email of the user.
 * @param {string} args.password - The password of the user.
 * @param {Context} context - The context object containing the Prisma client.
 * @return {Promise<Object>} A promise that resolves to an object with the message "User created".
 * @throws {Error} If the user already exists.
 */
async function register(_parent: unknown, args: { username: string, email: string, password: string }, context: Context) {
    const { username, email, password } = args

    validateUserRegisterSchema(args)

    const user = await context.prisma.user.findUnique({ where: { "email": email } })
    if (user) {
        throw new Error('User already exists')
    }

    await context.prisma.user.create({ data: { username, email, password } })
    return {"message": "User created"}	
}

/**
 * Adds a new book to the database.
 * Requires authentication.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {string} args.title - The title of the book.
 * @param {string} args.author - The author of the book.
 * @param {number} args.publishedYear - The published year of the book.
 * @param {Context} context - The context object containing the Prisma client.
 * @return {Promise<Object>} A promise that resolves to the created book object.
 * @throws {Error} If the user is not authenticated.
 */
async function addBook(_parent: unknown, args: { title: string, author: string, publishedYear: number }, context: Context) {
    const { userId } = context
    if(!userId) {
        throw new Error('User not authenticated')
    }
    const { title, author, publishedYear } = args
    validateBookSchema(args)
    return context.prisma.book.create({ data: { title, author, publishedYear } })
}

/**
 * Adds a review for a book.
 * Requires authentication.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {number} args.bookId - The ID of the book for which the review is being added.
 * @param {number} args.rating - The rating given in the review.
 * @param {string} args.comment - The comment provided in the review.
 * @param {Context} context - The context object containing the Prisma client.
 * @return {Promise<Object>} A promise that resolves to the created review object.
 * @throws {Error} If the user is not authenticated, book is not found, or validation fails.
 */
async function addReview(_parent: unknown, args: { bookId: number, rating: number, comment: string }, context: Context) {
    const { userId } = context
    if(!userId) {
        throw new Error('User not authenticated')
    }

    const { comment } = args
    const bookId = Number(args.bookId)
    const rating = Number(args.rating)

    validateReviewSchema({ bookId, userId, rating, comment })

    const book = await context.prisma.book.findUnique({ where: { "id": bookId } })

    if (!book) {
        throw new Error('Book not found')
    }
    return context.prisma.review.create({ data: { bookId, userId, rating, comment } })
}

/**
 * Updates a review with the provided review ID, rating, and comment.
 * Requires authentication.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {number} args.reviewId - The ID of the review to be updated.
 * @param {number} args.rating - The new rating for the review.
 * @param {string} args.comment - The new comment for the review.
 * @param {Context} context - The context object containing the Prisma client and user ID.
 * @return {Promise<Object>} A promise that resolves to the updated review object.
 * @throws {Error} If the user is not authenticated, review is not found, or user is not authorized to update the review.
 */
async function updateReview(_parent: unknown, args: { reviewId: number, rating: number, comment: string }, context: Context) {
    const { userId } = context
    if(!userId) {
        throw new Error('User not authenticated')
    }

    const { comment } = args
    const reviewId = Number(args.reviewId)
    const rating = Number(args.rating)
    validateReviewSchema({ id: reviewId, userId, rating, comment })
    const review = await context.prisma.review.findUnique({ where: { "id": reviewId } })

    if (!review) {
        throw new Error('Review not found')
    }
    if(review.userId !== userId) {
        throw new Error('You are not authorized to update this review')
    }
    return context.prisma.review.update({ where: { "id": reviewId }, data: { rating, comment } })
}

/**
 * Deletes a review based on the provided review ID.
 * Requires authentication.
 *
 * @param {unknown} _parent - The parent object in the GraphQL query.
 * @param {Object} args - The arguments passed to the function.
 * @param {number} args.reviewId - The ID of the review to be deleted.
 * @param {Context} context - The context object containing the Prisma client and user ID.
 * @return {Object} A message indicating the deletion of the review.
 */
async function deleteReview(_parent: unknown, args: { reviewId: number }, context: Context) {
    const { userId } = context
    if(!userId) {
        throw new Error('User not authenticated')
    }

    const reviewId = Number(args.reviewId)
    validateIdSchema(reviewId)
    const review = await context.prisma.review.findUnique({ where: { "id": reviewId } })

    if (!review) {
        throw new Error('Review not found')
    }
    if(review.userId !== userId) {
        throw new Error('You are not authorized to delete this review')
    }
    await context.prisma.review.delete({ where: { "id": reviewId } })
    return {"message": "Review deleted"}	
}