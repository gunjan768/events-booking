import React from 'react';
import { Bar as BarChart } from 'react-chartjs';

const BOOKINGS_BUCKETS = 
{
    Cheap: 
    {
        min: 0,
        max: 100
    },

    Normal: 
    {
        min: 100,
        max: 200
    },

    Expensive: 
    {
        min: 200,
        max: 10000000
    }
};

const bookingsChart = props => 
{
    const chartData = 
    { 
        labels: [], 
        datasets: [] 
    };

    let values = [];

    for(const bucket in BOOKINGS_BUCKETS) 
    {
        const filteredBookingsCount = props.bookings.reduce((prev, current) => 
        {
            if( current.event.price > BOOKINGS_BUCKETS[bucket].min && current.event.price < BOOKINGS_BUCKETS[bucket].max ) 
            return prev + 1;
            
            else 
            return prev;
            
        }, 0);

        values.push(filteredBookingsCount);

        // labels array will appear on the X-axis.
        chartData.labels.push(bucket);

        chartData.datasets.push(
        {
            // label: "My First dataset",
            fillColor: 'red',
            strokeColor: 'rgba(220, 220, 220, 0.8)',
            highlightFill: 'rgba(220, 220, 220, 0.75)',
            highlightStroke: 'rgba(220, 220, 220, 1)',
            data: values
        });

        // values array will appear on the Y-axis
        // for xth position we want first (x-1) elements as zero and last one will have some value i.e [0,0,0.....,0,val].
        values = [...values];
        values[values.length - 1] = 0;
    }

    return (
        <div style = {{ textAlign: 'center'}}>
            <BarChart data={chartData} />
        </div>
    );
}

export default bookingsChart;