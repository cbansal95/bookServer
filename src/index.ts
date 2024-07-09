import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { resolvers } from './resolvers.js'
import jsonwebtoken from 'jsonwebtoken'
import { readFileSync } from 'fs';
import { IdecodedUser, Context } from './types.js';
import prisma from './client.js';
import { validateDecodedUserSchema, validateIdSchema } from './schemaValidator.js';

const typeDefs = readFileSync('./src/schema.graphql', { encoding: 'utf-8' });

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const app = express();

const httpServer = http.createServer(app);
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/',
  cors<cors.CorsRequest>({
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    maxAge: 600,
    origin: [
      'http://localhost',
      'https://studio.apollographql.com'
    ],
  }),
  express.json({ limit: '50mb' }),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      let decodedUser: IdecodedUser | undefined;
      let userId: number | undefined;
      // cookie validation logic
      // if a cookie is present it's validated, but if it's not present, the user can still access the read only APIs
      if(req.headers.cookie) {
        const token = req.headers.cookie.split('=')[1]; // Assuming token is sent as a cookie
        try {
          decodedUser = jsonwebtoken.verify(token, JWT_SECRET) as IdecodedUser;
          if (!decodedUser || !decodedUser.email || !decodedUser.password) {
            throw new Error('User not authenticated')
        }
        validateDecodedUserSchema({"email": decodedUser.email, "password": decodedUser.password})
        const user = await prisma.user.findUnique({ where: { "email": decodedUser.email } })
    
        // This would look different in production as passwords won't be stored in plaintext
        if (!user || user.password !== decodedUser.password) {
            throw new Error('Invalid credentials')
        }
        userId = user.id
        validateIdSchema(userId)
        } catch (error) {
          // Instead of throwing an error here, we let the user signin again to set a working token
          console.error('Error verifying JWT token:', error);
        }
      }
      return { req, res, prisma, userId };
    }
  }),
);
await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);