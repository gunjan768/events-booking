const Event                 =       require("../../models/event");
const User                  =       require("../../models/user");
const bcrypt                =       require('bcrypt');


const events = eventIds =>
{
    return Event.find({_id: {$in: eventIds}})
    .then(events =>
    {
        return events.map(event =>
        {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString,
                creator: user.bind(this, event.creator)
            }
        })
    })
    .catch(error =>
    {
        throw error;
    })
}

const user = userId =>
{
    return User.findById(userId)
    .then(user =>
    {
        return { 
            ...user._doc,
            id: user.id,
            creator: events.bind(this, user._doc.createdEvents)
        }    
    })
    .catch(error =>
    {
        throw error;
    })
}

module.exports = 
{
    events: () =>
    {
        // return is used to tell graphql that saving data to databse is an asynchronous process
        return Event.find()
        .then(events =>
        {
            return events.map(event =>
            {
                return { 
                    ...event._doc ,
                    _id: event._doc._id.toString(),
                    date: new Date(event._doc.date).toISOString,
                    creator: user.bind(this, event._doc.creator)
                };
            })
        })
        .catch(error =>
        {
            console.log("Error while finding events",error);
            
            throw error;
        })
    },

    createEvent: args =>
    {
        const event = new Event(
        {
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            
            // Here we have directly entered the id in string form. Mongoose will convert it to object Id.
            creator: "5e85c5faaa32da33d81aacd6"
        })

        let createdEvent = null;

        // return is used to tell graphql that saving to databse is an asynchronous process
        return event.save()
        .then(result =>
        {
            console.log("Data saved to Mongodb",result._doc);

            createdEvent = 
            { 
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString,
                creator: user.bind(this, result._doc.creator)
            };

            return User.findById("5e85c5faaa32da33d81aacd6")
        })
        .then(user =>
        {
            if( !user )
            throw new Error('User not found');

            user.createdEvents.push(event);

            // It will not create a new user rather it will update the exisitng one.
            return user.save();
        })
        .then(result =>
        {
            console.log("result baby ba",result);

            // result._doc._id.toString() or result.id
            return createdEvent;
        })
        .catch(error =>
        {
            console.log("Error while Saving data to Mongodb",error);
            
            throw error;
        })
    },

    createUser: args =>
    {
        return User.findOne({ email: args.userInput.email })
        .then(user =>
        {
            if( user )
            throw new Error('User exists already');

            return bcrypt.hash(args.userInput.password, 12);
        })
        .then(hashedPassword =>
        {
            const user = new User(
            {
                email: args.userInput.email,
                password: hashedPassword
            })

            return user.save();
        })
        .then(result =>
        {
            // result._doc._id.toString() or result.id
            return { 
                ...result._doc,
                _id: result.id,
                password: result.password
            }
        })
        .catch(error =>
        {
            throw error;
        })
    }
}