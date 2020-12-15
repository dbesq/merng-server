
const { AuthenticationError, UserInputError, PubSubEngine, attachConnectorsToContext } = require('apollo-server')
const { argsToArgsConfig } = require('graphql/type/definition')

const Post = require('../../models/Post')
const checkAuth = require('../../util/check-auth')

module.exports = {
    /**
     *1. Get multiple Posts
     *2. Create a Post
     *3. Delete a Post
     *4. Like/Unlike a Post
    */

        // 1. Get Posts
        //      a.  All Posts ////////////////////////////////////////////////////////////////////////////
        Query: {
            async getPosts(){
                try{
                    const posts = await Post.find().sort({ createdAt: -1 })
                    return posts
                } catch(err){
                    throw new Error(err)
                }
            },

            // 1. Get Posts
            //      b.  Single Post ////////////////////////////////////////////////////////////////////////////
            async getPost(_, { postId }){
                try{
                    const post = await Post.findById(postId)
                    if(post){
                        return post
                    } else {
                        throw new Error ('Post not found')
                    } 
                } catch(err){
                    throw new Error(err)
                }
            }
        },

        Mutation: {
            // 2. Create a Post ////////////////////////////////////////////////////////////////////////////
            // Use request from context to see authorization headers
            async createPost(_, { body }, context){
                /** User
                 *      (i) gets auth token,
                 *      (ii) puts it in auth header to send w/ request
                 *      (iii) decode token and make sure user is authenticated
                 *      (iv) THEN, create the post 
                 */
                const user = checkAuth(context)
                if(body.trim() === ''){
                    throw new Error('Post body must not be empty')
                }

                const newPost = new Post({
                    body,
                    user: user.id,
                    username: user.username,
                    createdAt: new Date().toISOString()
                })
                const post = await newPost.save()

                context.pubsub.publish('NEW_POST', {
                    newPost: post
                })

                return post
            },

            // 3. Delete a Post ////////////////////////////////////////////////////////////////////////////
            async deletePost(_, { postId }, context){
                const user = checkAuth(context)
                // Make sure user can only delete its own post
                try{
                    const post = await Post.findById(postId)
                    if(user.username === post.username){
                        await post.delete()
                        return 'Post deleted successfully'
                    } else {
                        throw new AuthenticationError('Action not allowed')
                    }
                }catch(err){
                    throw new Error(err)
                }
            },

            // 4. Like/Unlike a Post ////////////////////////////////////////////////////////////////////////////
            async likePost(_, { postId }, context){
                const { username } = checkAuth(context)

                const post = await Post.findById(postId)

                if(post){
                    if(post.likes.find(like => like.username === username)){
                        // Post already liked, unlike it
                        post.likes = post.likes.filter(like => like.username !== username)
                    } else {
                        // Not liked, like post
                        post.likes.push({
                            username,
                            createdAt: new Date().toISOString()
                        })
                    }
                    await post.save()
                    return post
                } else {
                    throw new UserInputError('Post not found')
                }
            }
        },

        Subscription: {
            newPost: {
                subscribe: (_, __L, { pubsub }) => pubsub.asyncIterator('NEW_POST')
            }
        }
}