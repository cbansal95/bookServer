// (Tried) Creating a deepMock for unit testing
// Eventually defaulted to using jest.spyOn, but tried pursuing this approach
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { jest } from '@jest/globals'

import prisma from './client.js'

jest.mock('./client.js', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))


export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>