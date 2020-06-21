var mongoose            =       require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
{
    event:
    {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    user:
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
})

// timestamps is the property and if it is set to true thren mongoose will automatically add 'createdAt' and 'updatedAt' time property.

module.exports = mongoose.model('Booking',bookingSchema);