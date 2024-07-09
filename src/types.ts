import { StandaloneServerContextFunctionArgument } from '@apollo/server/standalone'
import { PrismaClient } from '@prisma/client'

export type IdecodedUser = {
    email: string
    password: string
}

// Extending the Prisma context to include relevant functions and state for resolvers
export interface Context extends StandaloneServerContextFunctionArgument {
    prisma: PrismaClient
    userId?: number
  }