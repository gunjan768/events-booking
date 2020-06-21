const Event                         =           require("../../models/event");
const { transformEvent }            =           require('./merge');
const User                          =           require('../../models/user');

module.exports = 
{
    events: async () =>
    {
        try 
        {
            const events = await Event.find();

            return events.map(event => transformEvent(event));
        }

        catch(error)
        {
            console.log("Error while finding events", error);

            throw error;
        }
    },  

    createEvent: async (args, req) =>
    {
        if( !req.isAuth )
        throw new Error("Unauthenticated");

        const event = new Event (
        {
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            
            // Here we have directly entered the id in string form. Mongoose will convert it to object Id.
            creator: req.userId
        })

        let createdEvent = null;

        try 
        {
            const result = await event.save();

            console.log("Data saved to Mongodb", result._doc);

            createdEvent = transformEvent(result);

            const creator = await User.findById(req.userId);

            if( !creator )
            throw new Error('User not found');

            creator.createdEvents.push(event);
            const result_2 = await creator.save();

            console.log("result baby ba", result_2);
           
            return createdEvent;
        }

        catch(error) 
        {
            console.log("Error while Saving data to Mongodb", error);

            throw error;
        }
    }
}