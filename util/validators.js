/** 
Add to type Mutation in graphql/typeDefs.js
Use in graphql/resolvers/users.js for validating new user registration

1.  Validate registration info
2.  Validate login info

*/


// 1.
module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword
) => {
    const errors = {}

    if(username.trim() === ''){
        errors.username = 'Username must not be empty'
    }

    if(email.trim() === ''){
        errors.email = 'Email must not be empty'
    } else{
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if(!email.match(regEx)){
            errors.email = 'Email must be a valid email address'
        }
    }

    if(password === ''){
        errors.password = 'Password must not be empty'
    } else if(password !== confirmPassword){
        errors.confirmPassword = 'Passwords must match'
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }
}

// 2.
module.exports.validateLoginInput = (username, password) => {
    const errors = {}

    if(username.trim() === ''){
        errors.username = 'Username must not be empty'
    }

    if(password.trim() === ''){
        errors.password = 'Password must not be empty'
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }

}