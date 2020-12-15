const { ApolloServer, PubSub } = require('apollo-server')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const MONGODB = process.env.MONGODB

const pubsub = new PubSub()

const PORT = process.env.PORT || 5000

const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Use context to get req fr/ Express, which is where authentication is handled
    // W/ this, can access req body in context -> see:
        // util/check-auth.js middleware helper function
        // graphql/resolvers/posts.createPost mutation
    // PubSub for subscriptions, if we want to implement them
    context: ({ req }) => ({ req, pubsub })
})

mongoose.connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`MongoDB Connected`)
        return server.listen({ port: PORT })
    })
    .then((res) => {
        console.log(`Server running at ${res.url}`)
    })
    .catch(err => {
        console.error(err)
    })
