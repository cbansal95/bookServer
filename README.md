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