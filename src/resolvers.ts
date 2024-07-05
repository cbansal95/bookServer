import jsonwebtoken from 'jsonwebtoken'
import { Context } from './types.js'
import { validateUserRegisterSchema, validateDecodedUserSchema, validateBookSchema, validateReviewSchema, validateIdSchema } from './schemaValidator.js'


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

function getBook(_parent: unknown, args: { id: number }, context: Context) {
    const id = Number(args.id)
    validateIdSchema(id)
    return context.prisma.book.findUnique({ where: { 'id': id } })
}

function getBooks(_parent: unknown, _args: {}, context: Context) {
    return context.prisma.book.findMany()
}

function getReviews(_parent: unknown, args: { bookId: number }, context: Context) {
    const bookId = Number(args.bookId)
    validateIdSchema(bookId)
    return context.prisma.review.findMany({ where: { 'bookId': bookId } })
}

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

async function getMyReviews(_parent: unknown, args: {  }, context: Context) {
    const { userId } = context
    if(!userId) {
        throw new Error('User not authenticated')
    }
    return context.prisma.review.findMany({ where: { userId } })
}

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

async function addBook(_parent: unknown, args: { title: string, author: string, publishedYear: number }, context: Context) {
    const { userId } = context
    if(!userId) {
        throw new Error('User not authenticated')
    }
    const { title, author, publishedYear } = args
    validateBookSchema(args)
    return context.prisma.book.create({ data: { title, author, publishedYear } })
}

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

async function updateReview(_parent: unknown, args: { reviewId: number, rating: number, comment: string }, context: Context) {
    const { userId } = context
    if(!userId) {
        throw new Error('User not authenticated')
    }

    const { comment } = args
    const reviewId = Number(args.reviewId)
    const rating = Number(args.rating)
    validateReviewSchema({ reviewId, userId, rating, comment })
    const review = await context.prisma.review.findUnique({ where: { "id": reviewId } })

    if (!review) {
        throw new Error('Review not found')
    }
    if(review.userId !== userId) {
        throw new Error('You are not authorized to update this review')
    }
    return context.prisma.review.update({ where: { "id": reviewId }, data: { rating, comment } })
}

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