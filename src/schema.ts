export const typeDefs = `
scalar DateTime
type Message {
  message: String
}
type User {
  id: Int!
  username: String!
  email: String!
  password: String
  #reviews: [Review!]!
}

type Book {
  id: Int!
  title: String!
  author: String!
  publishedYear: Int!
  #reviews: [Review!]!
}

type Review {
  id: Int!
  user: User!
  userId: Int!
  book: Book!
  bookId: Int!
  rating: Int!
  comment: String
  createdAt: DateTime!
}

type Query {
  getBooks: [Book!]!
  getBook(id: Int!): Book
  getReviews(bookId: Int!): [Review!]!
  login(email: String!, password: String!): Message
}

type Mutation {
  register(username: String!, email: String!, password: String!): Message!
}
`