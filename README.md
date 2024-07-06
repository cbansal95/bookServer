# Setting up the local environment

### 1. Database
The postgres database runs off a docker container. By default it pulls the latest image available and runs on the default port (5432). The database connection string is stored in the environment. Start the database service using the following command at the root of the repository:

    docker compose up


### 2. Installing Dependencies
Install dev and runtime dependencies using:

`npm install`

### 3. Migrating Prisma Schema
Create the necessary tables in the database using:

`npm run migrate`

Optional: Seed test data into the database using

`npm run seed`

### 4. Generating GraphQL code
Generate the necessary GraphQL types and bindings using:
`npm run codegen`

###  5. Starting the server
Start serving GraphQL queries  by starting the server using:
`npm run start`


### 6. Running the unit tests
Ensure that the TypeScript code is compiled to JavaScript. Compile using:
`npm run compile`

Start the test suite using:
`npm run test`

# Testing the APIs
When the API server is running, navigate to http://localhost:4000 (default) to open Apollo sandbox to interactively test the queries and mutations. 
**Important** : Click on the gear icon on the top left handside of the GraphQL explorer and enable cookies for authentication to function in the sandbox.

# Authentication
Using the login mutation sets a cookie names token, which contains a JWT. On future logins, the JWT is decoded by the Apollo context function and the user information is passed on to the resolvers.

# API Documentation
## Objects

> ! denotes a required field

```
User: {
id: Int!
username: String!
email: String!
password: String!
}

Book: {
id: Int!
title: String!
author: String!
publishedYear: Int!
}

Review: {
type Review {
id: Int!
userId: Int!
bookId: Int!
rating: Int!
comment: String!
createdAt: DateTime!
}
Message: {
message: String
}
}
```

## Authentication

The `login` method sets a cookie named `token` containing a JWT with the user email and password, signed with a secret. The JWT is validated in the context of the Apollo server and if valid, the user's id is made available to the resolvers through the context.

## Queries

### getBook
`getBook(id: Int!): Book`

Accepts a bookId (`id`) and returns a `Book` object 
Returns `null` if a book with that id isn't found
### getBooks
`getBooks(cursor: Int): [Book!]!`

Returns an array of `Book` objects or an empty array if no books are present in the table.
Accepts an optional `cursor` argument to paginate through results. The value expected here is the id of the last book from the previous page.
### getReviews
`getReviews(bookId: Int!, cursor: Int): [Review!]!`

Returns an array of `Review` objects or an empty array.
Accepts a required `bookId` parameter to filter by book and an optional `cursor` argument to paginate through results.
### getMyReviews
`getMyReviews: [Review!]`

Returns an array of `Review` objects filtered by the user's authenticated id, or an empty array.

## Mutations

### login
`login(email: String!, password: String!): Message!`

Accepts `email` and `password` as required params and sets a named cookie with a JWT token.
Returns a success message object: `{message: "User logged in"}`

### register
`register(username: String!, email: String!, password: String!): Message!`

Accepts username, email and password as params and creates a new user in the User table. 
Returns a success message object: `{message: "User created"}`

### addBook
`addBook(title: String!, author: String!, publishedYear: Int!): Book!`

Accepts title, author and publishedYear (must be >= 0) as params and creates a new book in the Book table.
Returns the newly created `Book` object.

### addReview
`addReview(bookId: ID!, rating: Int!, comment: String!): Review!`

Accepts bookId, rating (integer between 1 - 5) and a comment as params and creates a new rating.
Allows creating multiple reviews for the same book by the same user in current implementation.
Returns the newly created `Review` object.

### updateReview
`updateReview(reviewId: ID!, rating: Int!, comment: String!): Review!`

Accepts reviewId, rating and comment to update an existing review for a user.
Returns the updated `Review` object.

### deleteReview
`deleteReview(reviewId: ID!): Message!`

Accepts the reviewId for a user's review to be deleted.
Returns a success message object: `{message: "Review deleted"}`

## Error handling
All errors are returned in the Apollo/GraphQL format:
```
{
"errors":  [
{
"message":  "<error message>",
"locations":  [
{
"line":  lineNo,
"column":  colNo
}
],
"path":  ["<query/mutation being invoked>"],
"extensions":  {
"code":  "INTERNAL_SERVER_ERROR", #
"stacktrace":  []
}
}
]
}

```

Two major sources of errors are through input validation (using Joi) and record validation. Record validation errors consist of some such cases such as:

 - Trying to update/delete a non-existent review
 - Trying to update/delete someone else's review
 - Adding a review for a non-existent book

If a named cookie is not present/malformed, paths requiring authentication will emit the above error with the message `User not authenticated`.