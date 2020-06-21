const Booking                   =           require('../../models/booking');
const Event                     =           require('../../models/event');
const { transformEvent }        =           require('./merge');
const { transformBooking }      =           require('./merge');


module.exports = 
{
    bookings: async (args, req) =>
    {
        if( !req.isAuth )
        throw new Error("Umauthenticated");

        try
        {
            const bookings = await Booking.find();

            return bookings.map(booking => transformBooking(booking));
        }

        catch(error)
        {
            throw error;
        }
    },

    bookEvent: async (args, req) =>
    {
        if( !req.isAuth )
        throw new Error("Umauthenticated");

        const fetchedEvent = await Event.findOne({ _id: args.eventId });

        const booking = new Booking(
        {
            user: req.userId,
            event: fetchedEvent
        })

        const result = await booking.save();
 
        return transformBooking(result);
    },

    cancelBooking: async (args, req) =>
    {
        if( !req.isAuth )
        throw new Error("Umauthenticated");

        try
        {
            const booking = await Booking.findById(args.bookingId).populate('event');

            const event = transformEvent(booking._doc.event);

            const deleteResult = await Booking.deleteOne( { _id: args.bookingId } );

            return event;
        }

        catch(error) 
        {
            throw error;
        }
    }
}