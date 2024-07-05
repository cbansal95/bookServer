import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { resolvers } from './resolvers.js'
//import { typeDefs } from './schema.js'
import jsonwebtoken from 'jsonwebtoken'
import { readFileSync } from 'fs';
import { IdecodedUser, Context } from './types.js';
import { PrismaClient } from '@prisma/client'


const typeDefs = readFileSync('./src/schema.graphql', { encoding: 'utf-8' });

const JWT_SECRET = 'secret';

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
      if(req.headers.cookie) {
        const token = req.headers.cookie.split('=')[1]; // Assuming token is sent as a cookie
        try {
          decodedUser = jsonwebtoken.verify(token, JWT_SECRET) as IdecodedUser;
        } catch (error) {
          console.error('Error verifying JWT token:', error);
        }
      }
      return { req, res, prisma: new PrismaClient(), decodedUser };
    }
  }),
);
await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);

// const server = new ApolloServer<Context>({
//     typeDefs,
//     resolvers,
//   });

//   const { url } = await startStandaloneServer(server, {
//     // context: createContext,
//     context: async ({ req, res }) => {
//       let decodedUser: IdecodedUser | undefined;
//       const prisma = new PrismaClient();

//       console.log(req.headers)
//       if (req.headers.cookie) {
//           const token = req.headers.cookie; // Assuming token is sent as a cookie
//           try {
//             console.log(token)
//               decodedUser = jsonwebtoken.verify(token, JWT_SECRET) as IdecodedUser;
//           } catch (error) {
//               console.error('Error verifying JWT token:', error);
//           }
//       }
//       console.log(decodedUser)
//       return { req, res, prisma, decodedUser };
//   },
//     listen: { port: 4000 },
//   });
  