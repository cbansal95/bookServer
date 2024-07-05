// Import necessary dependencies and functions for testing
import { Context } from './types.js';
import { resolvers } from './resolvers.js';
import { validateIdSchema } from './schemaValidator.js';
import express from 'express';
import { PrismaClient } from '@prisma/client'
import { prismaMock } from './singleton.js';

// Mock the context object for testing purposes


const mockContext = {
    req: {} as express.Request,
    res: {} as express.Response,
    prisma: prismaMock,
    } as Context;

describe('getBook function', () => {
    it('should return the book with the provided ID', async () => {
        const mockParent = {};
        const mockArgs = { id: 1 };

        // Mock the behavior of the validateIdSchema function
        //const validateIdSchemaMock = jest.fn();

        // Mock the response of the Prisma client
        prismaMock.book.findUnique.mockResolvedValue({ id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 });

        const result = await resolvers.Query.getBook(mockParent, mockArgs, mockContext);

        expect(validateIdSchema).toHaveBeenCalledWith(1);
        expect(mockContext.prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual({ id: 1, title: 'Test Book' });
    });
});