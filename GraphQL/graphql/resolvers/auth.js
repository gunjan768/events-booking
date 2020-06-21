const User                  =           require("../../models/user");
const bcrypt                =           require('bcrypt');
const jwt                   =           require('jsonwebtoken');

module.exports = 
{
    createUser: async args =>
    {
        try 
        {
            const userFound = await User.findOne({ email: args.userInput.email });

            if(userFound)
            throw new Error('User exists already');

            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

            const user = new User(
            {
                email: args.userInput.email,
                password: hashedPassword
            });

            const result = await user.save();

            // result._doc._id.toString() or result.id
            return {
                ...result._doc,
                _id: result.id,
                password: result.password
            }
        }

        catch(error) 
        {
            throw error;
        }
    },

    login: async args =>
    {
        try
        {
            const user = await User.findOne({ email: args.email });

            if( !user )
            throw new Error("User doesn't exist");

            const isEqual = await bcrypt.compare(args.password, user.password);
            
            if( !isEqual )
            throw new Error("Plese check your password !!");

            const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            }, 
                process.env.SECRET_KEY,
            {
                expiresIn: '1h'
            });

            return {
                userId: user.id,
                token: token,
                tokenExpiration: 1
            };
        }

        catch(error)
        {
            throw error;
        }
    }
}