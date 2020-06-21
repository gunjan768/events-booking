import React, { Component } from 'react';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/authContext';
import BookingList from '../components/Bookings/BookingList/BookingList';
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart';
import BookingsControls from '../components/Bookings/BookingsControl/BookingsControl';

class BookingsPage extends Component 
{
    state = 
    {
        isLoading: false,
        bookings: [],
        outputType: "list"
    };

    static contextType = AuthContext;

    componentDidMount() 
    {
        this.fetchBookings();
    }

    fetchBookings = async () => 
    {
        try
        {
            this.setState({ isLoading: true });

            const requestBody = 
            {
                query: `
                    query 
                    {
                        bookings 
                        {
                            _id
                            createdAt
                            event 
                            {
                                _id
                                title
                                date
                                price
                            }
                        }
                    }
                `
            };
    
            const result = await fetch('http://localhost:8000/graphql', 
            {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: 
                {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.context.token
                }
            });
            
            if( result.status !== 200 && result.status !== 201 )
            throw new Error('Failed!');
            
            const resData = await result.json();
            const bookings = resData.data.bookings;
            
            this.setState({ bookings: bookings, isLoading: false });
        }

        catch(error)
        {
            this.setState({ isLoading: false });

            throw error;
        }
       
    }

    deleteBookingHandler = bookingId => 
    {
        this.setState({ isLoading: true });
        
        // $ sign before any string in graphql represents that the string is a variable ( or variable name )
        const requestBody = 
        {
            query: `
                mutation CancelBooking($id: ID!)
                {
                    cancelBooking(bookingId: $id) 
                    {
                        _id
                        title
                    }
                }
            ` ,
            variables:
            {
                id: bookingId
            }
        }

        fetch('http://localhost:8000/graphql', 
        {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: 
            {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.context.token
            }
        })
        .then(res => 
        {
            if( res.status !== 200 && res.status !== 201 )
            throw new Error('Failed!');

            return res.json();
        })
        .then(resData => 
        {
            this.setState(prevState => 
            {
                const updatedBookings = prevState.bookings.filter(booking => booking._id !== bookingId);

                return { 
                    bookings: updatedBookings, 
                    isLoading: false 
                };
            });
        })
        .catch(err => 
        {
            console.log("While deleting booking",err);

            this.setState({ isLoading: false });
        });
    }

    changeOutputTypeHandler = outputType =>
    {
        this.setState({ outputType });
    }   

    render() 
    {
        let content = <Spinner />;

        if( !this.state.isLoading )
        {
            content = (
                <React.Fragment>
                    
                    <BookingsControls
                        activeOutputType = { this.state.outputType }
                        onChange = { this.changeOutputTypeHandler }
                    />

                    <div>
                        {
                            this.state.outputType === "list" ?
                                <BookingList 
                                    onDelete = { this.deleteBookingHandler }
                                    bookings = { this.state.bookings }/>
                            :
                                <BookingsChart bookings = { this.state.bookings }/>
                        }
                    </div>

                </React.Fragment>
            )
        }

        return (
            <React.Fragment>
                { content }
            </React.Fragment>
        );
    }
}

export default BookingsPage;