// Helper function to check if user is authorized
// See root-level index.js, posts.js in createPost mutation

const { AuthenticationError } = require('apollo-server')

const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

module.exports = (context) => {
    // context = { ... headers }
    const authHeader = context.req.headers.authorization
    if(authHeader){
        // Bearer ....
        const token = authHeader.split('Bearer ')[1]
        if(token){
            try{
                const user = jwt.verify(token, SECRET_KEY)
                return user
            } catch(err){
                throw new AuthenticationError('Invalid/Expired token')
            }
        }
        // If no token
        throw new Error(`Authentication token must be 'Bearer [token]'`)
    }
    // If no auth header
    throw new Error(`Authorization header must be provided`)

}