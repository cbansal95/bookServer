import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { resolvers } from './resolvers.js'
import { typeDefs } from './schema.js'
import {Request, Response, NextFunction} from 'express'

const JWT_SECRET = 'secret';

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => ({ req, res }),
    listen: { port: 4000 },
  });
  
  console.log(`🚀  Server ready at: ${url}`);