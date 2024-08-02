// Import necessary dependencies and functions for testing
import { Context } from './types.js';
import { resolvers } from './resolvers.js';
import * as express from 'express';
import { prismaMock } from './singleton.js';
import { jest } from '@jest/globals';


// Mock the context object for testing purposes


const mockContext = {
    req: {} as express.Request,
    res: {
        setHeader: jest.fn(),
    } as unknown as express.Response,
    prisma: prismaMock,
    } as Context;
    const setHeaderMock = jest.spyOn(mockContext.res, 'setHeader');
    const bookfindUniqueMock = jest.spyOn(prismaMock.book, 'findUnique');
    const bookfindManyMock = jest.spyOn(prismaMock.book, 'findMany');
    const bookCreateMock = jest.spyOn(prismaMock.book, 'create');
    const reviewfindManyMock = jest.spyOn(prismaMock.review, 'findMany');
    const reviewFindUniqueMock = jest.spyOn(prismaMock.review, 'findUnique');
    const reviewUpdateMock = jest.spyOn(prismaMock.review, 'update');
    const reviewDeleteMock = jest.spyOn(prismaMock.review, 'delete');
    const reviewCreateMock = jest.spyOn(prismaMock.review, 'create');
    const userfindUniqueMock = jest.spyOn(prismaMock.user, 'findUnique');
    const userCreateMock = jest.spyOn(prismaMock.user, 'create');

describe('getBook function', () => {
    it('should return the book with the provided ID', async () => {
        const mockParent = {};
        const mockArgs = { id: 1 };
;
        //prismaMock.book.findUnique.mockResolvedValueOnce({ id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 });
        bookfindUniqueMock.mockResolvedValueOnce({ id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 });
        const result = await resolvers.Query.getBook(mockParent, mockArgs, mockContext);

        expect(mockContext.prisma.book.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockContext.prisma.book.findUnique).toBeDefined();
        expect(mockContext.prisma.book.findUnique).not.toThrow();
        expect(result).toEqual({ id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 });
    });
});

describe('getBook function', () => {
    it('should throw validation error on invalid ID', async () => {
        const mockParent = {};
        const mockArgs = { id: -1 };
        try{
            await resolvers.Query.getBook(mockParent, mockArgs, mockContext);
        }
        catch(error) {
            expect(error).toEqual(new Error('Id validation error: "value" must be greater than -1'));
        }
    });
});

describe('getBooks function', () => {
    it('should return all books', async () => {
        const mockParent = {};
        const mockArgs = {};
        bookfindManyMock.mockResolvedValueOnce([{ id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 }]);
        const result = await resolvers.Query.getBooks(mockParent, mockArgs, mockContext);
        expect(result).toEqual([{ id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 }]);
    });
})

describe('getBooks function', () => {
    it('should return empty array on empty table', async () => {
        const mockParent = {};
        const mockArgs = {};
        bookfindManyMock.mockResolvedValueOnce([]);
        const result = await resolvers.Query.getBooks(mockParent, mockArgs, mockContext);
        expect(result).toEqual([]);
    });
})

describe('getReviews function', () => {
    it('should return all reviews for a book', async () => {
        const mockParent = {};
        const mockArgs = { bookId: 1 };
        const thisDate = new Date();
        reviewfindManyMock.mockResolvedValueOnce([{ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5 , createdAt: thisDate }]);
        const result = await resolvers.Query.getReviews(mockParent, mockArgs, mockContext);
        expect(result).toEqual([{ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5 , createdAt: thisDate }]);
    });
})

describe('getReviews function', () => {
    it('should return empty array for a non-existent book', async () => {
        const mockParent = {};
        const mockArgs = { bookId: 10000 };
        const thisDate = new Date();
        reviewfindManyMock.mockResolvedValueOnce([]);
        const result = await resolvers.Query.getReviews(mockParent, mockArgs, mockContext);
        expect(result).toEqual([]);
    });
})

describe('login function', () => {
    it('should throw validation error on invalid credentials', async () => {
        const mockParent = {};
        const mockArgs = { email: 'test@example.com', password: 'test' };
        userfindUniqueMock.mockResolvedValueOnce(null);
        try{
            await resolvers.Mutation.login(mockParent, mockArgs, mockContext);
        }
        catch(error) {
            expect(error).toEqual(new Error('Invalid credentials'));
        }
    });
})

describe('login function', () => {
    it('should return a message on successful login', async () => {
        const mockParent = {};
        const mockArgs = { email: 'test@example.com', password: 'test' };
        userfindUniqueMock.mockResolvedValueOnce({ id: 1, username: 'test', email: 'test@example.com', password: 'test' });
        setHeaderMock.mockName("setHeader");
        const result = await resolvers.Mutation.login(mockParent, mockArgs, mockContext);
        expect(result).toEqual({"message": "User logged in"});
    });
})

describe('getMyReviews function', () => {
    it('should return all reviews for a user', async () => {
        const mockParent = {};
        const mockArgs = { };
        mockContext.userId = 1;
        const thisDate = new Date();
        reviewfindManyMock.mockResolvedValueOnce([{ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5 , createdAt: thisDate }]);
        const result = await resolvers.Query.getMyReviews(mockParent, mockArgs, mockContext);
        expect(result).toEqual([{ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5 , createdAt: thisDate }]);
        delete mockContext.userId;
    });
})

describe('getMyReviews function', () => {
    it('should return an error if not logged in', async () => {
        const mockParent = {};
        const mockArgs = { };
        const thisDate = new Date();
        reviewfindManyMock.mockResolvedValueOnce([{ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5 , createdAt: thisDate }]);
        try {
            await resolvers.Query.getMyReviews(mockParent, mockArgs, mockContext);
        } catch (error) {
            expect(error).toEqual(new Error('User not authenticated'));
        }
    });
})

describe('register function', () => {
    it('should throw error for existing user', async () => {
        const mockParent = {};
        const mockArgs = { username: 'test', email: 'test@example.com', password: 'test' };
        userfindUniqueMock.mockResolvedValueOnce({ id: 1, username: 'test', email: 'test@example.com', password: 'test' });
        try{
            await resolvers.Mutation.register(mockParent, mockArgs, mockContext);
        }
        catch(error) {
            expect(error).toEqual(new Error('User already exists'));
        }
    });
})

describe('register function', () => {
    it('should return a message on successful registration', async () => {
        const mockParent = {};
        const mockArgs = { username: 'test', email: 'test@example.com', password: 'test' };
        userfindUniqueMock.mockResolvedValueOnce(null);
        userCreateMock.mockResolvedValueOnce({ id: 1, username: 'test', email: 'test@example.com', password: 'test' });
        const result = await resolvers.Mutation.register(mockParent, mockArgs, mockContext);
        expect(result).toEqual({"message": "User created"});
    });
})

describe('addBook function', () => {
    it('should throw validation error on invalid book', async () => {
        const mockParent = {};
        const mockArgs = { title: 'Test Book', author: 'Test Author', publishedYear: -1 };
        mockContext.userId = 1;
        try{
            await resolvers.Mutation.addBook(mockParent, mockArgs, mockContext);
        }
        catch(error) {
            expect(error).toEqual(new Error('Book schema validation error: "publishedYear" must be greater than -1'));
        }
        delete mockContext.userId;
    });
})

describe('addBook function', () => {
    it('should return a message on successful book creation', async () => {
        const mockParent = {};
        const mockArgs = { title: 'Test Book', author: 'Test Author', publishedYear: 2022 };
        mockContext.userId = 1;
        bookCreateMock.mockResolvedValueOnce({ id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 });
        const result = await resolvers.Mutation.addBook(mockParent, mockArgs, mockContext);
        expect(result).toEqual({ id: 1, title: 'Test Book', author: 'Test Author', publishedYear: 2022 });
        delete mockContext.userId;
    });
})

describe('addReview function', () => {
    it('should throw validation error on invalid rating', async () => {
        const mockParent = {};
        const mockArgs = { bookId: 1, comment: 'Test Content', rating: -1 };
        mockContext.userId = 1;
        try{
            await resolvers.Mutation.addReview(mockParent, mockArgs, mockContext);
        }
        catch(error) {
            expect(error).toEqual(new Error('Review schema validation error: "rating" must be greater than 0'));
        }
        delete mockContext.userId;
    });
})

describe('addReview function', () => {
    it('should return a message on successful review creation', async () => {
        const mockParent = {};
        const mockArgs = { bookId: 1, comment: 'Test Content', rating: 5 };
        mockContext.userId = 1;
        const thisDate = new Date();
        reviewCreateMock.mockResolvedValueOnce({ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5, createdAt: thisDate });
        const result = await resolvers.Mutation.addReview(mockParent, mockArgs, mockContext);
        expect(result).toEqual({ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5, createdAt: thisDate });
        delete mockContext.userId;
    });
})

describe('updateReview function', () => {
    it('should throw validation error on missing book details', async () => {
        const mockParent = {};
        const mockArgs = { reviewId: 1, comment: 'Test Content', rating: 1 };
        mockContext.userId = 1;
        try{
            await resolvers.Mutation.updateReview(mockParent, mockArgs, mockContext);
        }
        catch(error) {
            expect(error).toEqual(new Error('Review schema validation error: "bookId" is required'));
        }
        delete mockContext.userId;
    });
})

describe('updateReview function', () => {
    it('should return a message on successful review update', async () => {
        const mockParent = {};
        const mockArgs = { reviewId: 1, comment: 'Test Content', rating: 5 };
        mockContext.userId = 1;
        const thisDate = new Date();
        reviewUpdateMock.mockResolvedValueOnce({ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5, createdAt: thisDate });
        const result = await resolvers.Mutation.updateReview(mockParent, mockArgs, mockContext);
        expect(result).toEqual({ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5, createdAt: thisDate });
        delete mockContext.userId;
    });
})

describe('deleteReview function', () => {
    it('should throw validation error on trying to delete non-existent review', async () => {
        const mockParent = {};
        const mockArgs = { reviewId: 1 };
        mockContext.userId = 1;
        reviewFindUniqueMock.mockResolvedValueOnce(null);
        try{
            await resolvers.Mutation.deleteReview(mockParent, mockArgs, mockContext);
        }
        catch(error) {
            expect(error).toEqual(new Error('Review not found'));
        }
        delete mockContext.userId;
    });
})

describe('deleteReview function', () => {
    it('should return a message on successful review deletion', async () => {
        const mockParent = {};
        const mockArgs = { reviewId: 1 };
        mockContext.userId = 1;
        const thisDate = new Date();
        reviewFindUniqueMock.mockResolvedValueOnce({ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5, createdAt: thisDate });
        reviewDeleteMock.mockResolvedValueOnce({ id: 1, bookId: 1, userId: 1, comment: 'Test Content', rating: 5, createdAt: thisDate });
        const result = await resolvers.Mutation.deleteReview(mockParent, mockArgs, mockContext);
        expect(result).toEqual({"message": "Review deleted"});
        delete mockContext.userId;
    });
})