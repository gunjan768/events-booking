const Event                     =           require('../../models/event');
const User                      =           require('../../models/user');
const { dateToString }          =           require('../../helpers/date');
const DataLoader                =           require('dataloader');


const eventLoader = new DataLoader(eventIds =>
{
    return events(eventIds);
})

const userLoader = new DataLoader(userIds =>
{
    return User.find({ _id: { $in: userIds }});
})
    
const events = async eventIds =>
{
    try 
    {
        const events = await Event.find({ _id: { $in: eventIds } });
        
        // As events returned by the MongoDb is arbitrary so we need to sort the events as per eventsIds we are geeting from eventLoader
        // else we will face a problem ( when you will book some event you might end booking some other event ).
        events.sort((event1,event2) =>
        {
            return (
                eventIds.indexOf(event1._id.toString()) - eventIds.indexOf(event2._id.toString())
            );
        })

        return events.map(event => transformEvent(event));
    }

    catch(error) 
    {
        throw error;
    }
}

const user = async userId =>
{
    try 
    {
        const user = await userLoader.load(userId.toString());
        
        return {
            ...user._doc,
            id: user.id,
            createdEvents: () => eventLoader.loadMany( user._doc.createdEvents )
        }
    }
    
    catch(error) 
    {
        throw error;
    }
}

const singleEvent = async eventId =>
{
    try
    {  
        const event = await eventLoader.load(eventId.toString());

        return event;
    }

    catch(error)
    {
        throw error;
    }
}

const transformEvent = event =>
{
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)
    }
}

const transformBooking = booking =>
{
    return {
        ...booking._doc,
        _id: booking.id,
        user: user.bind(this,booking._doc.user),
        event: singleEvent.bind(this,booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
}

module.exports = 
{
    transformEvent,
    transformBooking
}