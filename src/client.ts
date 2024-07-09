// Creating a singleton Prisma client for use across resolvers
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default prisma

