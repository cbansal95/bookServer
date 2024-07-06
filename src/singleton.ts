import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { jest } from '@jest/globals'

import prisma from './client.js'
import { Book } from './generated/graphql.js'

//const newBook = { id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 }

jest.mock('./client.js', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

// beforeEach(() => {
//   mockReset(prismaMock)
// })

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>