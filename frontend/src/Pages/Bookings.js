import React, { useEffect, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { BOOKINGS, CANCEL_BOOKING } from './queries';
import Error from '../components/Error';
import BookingItem from '../components/BookingItem';
import Spinner from '../components/Spinner';

export default function BookingsPage() {
    const [alert, setAlert] = useState('');
    const [showInitialSpinner, setShowInitialSpinner] = useState(true);
    const client = useApolloClient();
    const { loading: queryLoading, error: queryError, data: queryData } = useQuery(BOOKINGS);

    const [cancelBooking, { loading, error, data }] = useMutation(CANCEL_BOOKING, {
        onError: (error) => setAlert(error.message),
        onCompleted: () => {
            setAlert('تم إلغاء حجزك');
            client.refetchQueries({
                include: ['Bookings']
            });
        },
        refetchQueries: [{ query: BOOKINGS }],
    });

    useEffect(() => {
        if (!queryError) return;
        setAlert(queryError.message);
        const timer = setTimeout(() => setAlert(''), 5000);
        return () => clearTimeout(timer);
    }, [queryError]);

    useEffect(() => {
        if (!error && !data) return;
        const timer = setTimeout(() => setAlert(''), error ? 5000 : 3000);
        return () => clearTimeout(timer);
    }, [error, data]);

    useEffect(() => {
        const timer = setTimeout(() => setShowInitialSpinner(false), 6000);
        return () => clearTimeout(timer);
    }, []);

    const shouldShowSpinner = showInitialSpinner || (queryLoading && !queryData);

    const cancelBookingHandler = (bookingId) => {
        cancelBooking({ variables: { bookingId } });
    };

    return (
        <div className='container-fluid'>
            <Error error={alert} type='success' />
            <h2 className='mb-3 text-center'>المناسبات التي حجزتها</h2>

            <div className='row justify-content-center mt-4'>
                {shouldShowSpinner ? (
                    <Spinner />
                ) : queryData?.bookings?.length ? (
                    queryData.bookings.map((booking) => (
                        <BookingItem
                            key={booking._id}
                            _id={booking._id}
                            event={booking.event}
                            createdAt={booking.createdAt}
                            onCancelBooking={cancelBookingHandler}
                            cancelDisabled={loading}
                        />
                    ))
                ) : (
                    <p className='text-center mt-4'>لا توجد حجوزات بعد.</p>
                )}
            </div>
        </div>
    );
}