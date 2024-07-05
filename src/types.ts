import { StandaloneServerContextFunctionArgument } from '@apollo/server/standalone'
import { PrismaClient } from '@prisma/client'

export type IdecodedUser = {
    email: string
    password: string
}

export interface Context extends StandaloneServerContextFunctionArgument {
    prisma: PrismaClient
    userId?: number
  }