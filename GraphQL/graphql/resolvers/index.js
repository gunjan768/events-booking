const authResolver          =           require('./auth');
const eventResolver         =           require('./events');
const bookingResolver       =           require('./booking');


// const rootResolver = 
// {
//     ...authResolver,
//     ...eventResolver,
//     ...bookingResolver
// }

// module.exports = rootResolver;

// Use like the above one or below one

module.exports =
{
    ...authResolver,
    ...eventResolver,
    ...bookingResolver
}