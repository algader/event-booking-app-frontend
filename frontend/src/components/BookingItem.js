import React from 'react';

export default function BookingItem({ _id, event, createdAt, onCancelBooking, cancelDisabled }) {
    const sourceDate = event?.date || createdAt;
    const formattedDate = sourceDate
        ? new Date(sourceDate).toLocaleDateString('en-US')
        : '';

    return (
        <div className="bookings-item col-md-6 col-lg-4 col-12">
            <div className="d-grid gap-3 h-100 text-center align-items-center flex-column">
                <div>
                    <h3 className='mb-4'>{event?.title || '---'}</h3>
                    <p className='mb-3'>
                        {formattedDate} - ${event?.price ?? ''}
                    </p>
                    <p className='mb-4'>{event?.description || ''}</p>
                </div>
                <button className="btn" onClick={() => onCancelBooking(_id)} disabled={cancelDisabled}>
                    إلغاء
                </button>
            </div>
        </div>
    );
}