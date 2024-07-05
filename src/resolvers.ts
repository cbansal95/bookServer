import jsonwebtoken from 'jsonwebtoken'
import http from 'http'
import * as graphqltypes from './generated/graphql.js'
import { IdecodedUser, Context } from './types.js'


const JWT_SECRET = 'secret';

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
    const { id } = args
    return context.prisma.book.findUnique({ where: { 'id': id } })
}

function getBooks(_parent: unknown, _args: {}, context: Context) {
    return context.prisma.book.findMany()
}

function getReviews(_parent: unknown, args: { bookId: number }, context: Context) {
    const { bookId } = args
    return context.prisma.review.findMany({ where: { 'bookId': bookId } })
}

async function login(_parent: unknown, args: { email: string, password: string }, context: Context) {
    const { email, password } = args
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
    //check if user is valid
    const { decodedUser } = context
    if (!decodedUser || !decodedUser.email || !decodedUser.password) {
        throw new Error('User not authenticated')
    }

    const user = await context.prisma.user.findUnique({ where: { "email": decodedUser.email } })

    if (!user || user.password !== decodedUser.password) {
        throw new Error('Invalid credentials')
    }
    return context.prisma.review.findMany({ where: { 'userId': user.id } })
}

async function register(_parent: unknown, args: { username: string, email: string, password: string }, context: Context) {
    const { username, email, password } = args
    await context.prisma.user.create({ data: { username, email, password } })
    return {"message": "User created"}	
}

async function addBook(_parent: unknown, args: { title: string, author: string, publishedYear: number }, context: Context) {
    //check if user is valid
    const { decodedUser } = context
    if (!decodedUser || !decodedUser.email || !decodedUser.password) {
        throw new Error('User not authenticated')
    }

    const user = await context.prisma.user.findUnique({ where: { "email": decodedUser.email } })

    if (!user || user.password !== decodedUser.password) {
        throw new Error('Invalid credentials')
    }
    const { title, author, publishedYear } = args
    return context.prisma.book.create({ data: { title, author, publishedYear } })
}

async function addReview(_parent: unknown, args: { bookId: number, rating: number, comment: string }, context: Context) {
    const { decodedUser } = context
    if (!decodedUser || !decodedUser.email || !decodedUser.password) {
        throw new Error('User not authenticated')
    }

    const user = await context.prisma.user.findUnique({ where: { "email": decodedUser.email } })

    if (!user || user.password !== decodedUser.password) {
        throw new Error('Invalid credentials')
    }

    const { comment } = args
    const bookId = Number(args.bookId)
    const rating = Number(args.rating)
    const book = await context.prisma.book.findUnique({ where: { "id": bookId } })

    if (!book) {
        throw new Error('Book not found')
    }
    return context.prisma.review.create({ data: { bookId, userId: user.id, rating, comment } })
}

async function updateReview(_parent: unknown, args: { reviewId: number, rating: number, comment: string }, context: Context) {
    const { decodedUser } = context
    if (!decodedUser || !decodedUser.email || !decodedUser.password) {
        throw new Error('User not authenticated')
    }

    const user = await context.prisma.user.findUnique({ where: { "email": decodedUser.email } })

    if (!user || user.password !== decodedUser.password) {
        throw new Error('Invalid credentials')
    }

    const { comment } = args
    const reviewId = Number(args.reviewId)
    const rating = Number(args.rating)
    const review = await context.prisma.review.findUnique({ where: { "id": reviewId } })

    if (!review) {
        throw new Error('Review not found')
    }
    if(review.userId !== user.id) {
        throw new Error('You are not authorized to update this review')
    }
    return context.prisma.review.update({ where: { "id": reviewId }, data: { rating, comment } })
}

async function deleteReview(_parent: unknown, args: { reviewId: number }, context: Context) {
    const { decodedUser } = context
    if (!decodedUser || !decodedUser.email || !decodedUser.password) {
        throw new Error('User not authenticated')
    }

    const user = await context.prisma.user.findUnique({ where: { "email": decodedUser.email } })

    if (!user || user.password !== decodedUser.password) {
        throw new Error('Invalid credentials')
    }

    const reviewId = Number(args.reviewId)
    const review = await context.prisma.review.findUnique({ where: { "id": reviewId } })

    if (!review) {
        throw new Error('Review not found')
    }
    if(review.userId !== user.id) {
        throw new Error('You are not authorized to delete this review')
    }
    await context.prisma.review.delete({ where: { "id": reviewId } })
    return {"message": "Review deleted"}	
}