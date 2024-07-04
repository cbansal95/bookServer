import { PrismaClient } from '@prisma/client'
import * as Jwt from 'jsonwebtoken'
import http from 'http'
const prismaClient = new PrismaClient()

const JWT_SECRET = 'secret';

export const resolvers = {
    Query: {
        getBooks,
        getBook,
        getReviews,
        login
    },

    Mutation: {
        register
    }
}

function getBook(_parent: unknown, args: { id: number }, context: { req: http.IncomingMessage, res: http.ServerResponse }) {
    const { id } = args
    return prismaClient.book.findUnique({ where: { 'id': id } })
}

function getBooks() {
    return prismaClient.book.findMany()
}

function getReviews(_parent: unknown, args: { bookId: number }) {
    const { bookId } = args
    return prismaClient.review.findMany({ where: { 'bookId': bookId } })
}

async function register(_parent: unknown, args: { username: string, email: string, password: string }) {
    const { username, email, password } = args
    await prismaClient.user.create({ data: { username, email, password } })
    return {"message": "User created"}	
}

async function login(_parent: unknown, args: { email: string, password: string }, context: { req: http.IncomingMessage, res: http.ServerResponse }) {
    const { email, password } = args
    const user = await prismaClient.user.findUnique({ where: { "email": email } })
    if (!user || user.password !== password) {
        throw new Error('Invalid credentials')
    }

    //context.res.appendHeader('Authorization', `Bearer ${token}`)
    return {"message": "User logged in"}	
}