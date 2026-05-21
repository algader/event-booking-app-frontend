import React, { useContext, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { EVENTS, BOOK_EVENT, CREATE_EVENT, EVENT_ADDED } from './queries';
import AuthContext from '../context/auth-context';
import EventItem from '../components/EventItem';
import SimpleModal from '../components/SimpleModal';
import { useNavigate } from 'react-router-dom';
import Error from '../components/Error';
import { useApolloClient } from '@apollo/client/react';
import Spinner from '../components/Spinner';





function EventList() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [alert, setAlert ] = useState('');
  const [showInitialSpinner, setShowInitialSpinner] = useState(true);
  const { loading, error, data } = useQuery(EVENTS, {
    pollInterval: 5000,
  });
  const value = useContext(AuthContext);
  const [creating, setCreating] = useState(false);
  const [modalAlert, setModalAlert] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const knownEventIdsRef = useRef(new Set());
  const lastNotifiedEventIdRef = useRef('');
  const client = useApolloClient()
  const navigate = useNavigate();

  const {
    data: subscriptionData,
    error: subscriptionError,
  } = useSubscription(EVENT_ADDED);

  useEffect(() => {
    const timer = setTimeout(() => setShowInitialSpinner(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const addedEvent = subscriptionData?.eventAdded;
    if (!addedEvent) return;

    setAlert(`أُضيفت مناسبة جديدة بعنوان: ${addedEvent.title}`);
    client.refetchQueries({ include: ['Events'] });
    const timer = setTimeout(() => setAlert(''), 4000);
    return () => clearTimeout(timer);
  }, [subscriptionData, client]);

  useEffect(() => {
    if (!subscriptionError) return;

    setAlert('فشل استقبال المناسبات الجديدة');
    const timer = setTimeout(() => setAlert(''), 4000);
    return () => clearTimeout(timer);
  }, [subscriptionError]);

  useEffect(() => {
    if (!data?.events?.length) return;

    const currentIds = new Set(data.events.map((event) => event._id));
    const knownIds = knownEventIdsRef.current;

    if (knownIds.size === 0) {
      knownEventIdsRef.current = currentIds;
      return;
    }

    const newEvents = data.events.filter((event) => !knownIds.has(event._id));
    if (newEvents.length > 0) {
      const newestEvent = newEvents[0];
      if (lastNotifiedEventIdRef.current !== newestEvent._id) {
        setAlert(`أُضيفت مناسبة جديدة بعنوان: ${newestEvent.title}`);
        lastNotifiedEventIdRef.current = newestEvent._id;
        setTimeout(() => setAlert(''), 4000);
      }
    }

    knownEventIdsRef.current = currentIds;
  }, [data]);




  const [bookEvent, { loading: bookingLoading }] = useMutation(BOOK_EVENT, {
    onCompleted: () => {
      setSelectedEvent(null);
      setAlert('تم حجز المناسبة بنجاح ✓');
      setTimeout(() => setAlert(''), 3000);
    },
    onError: (err) => { 
      console.error(err.message);
      setSelectedEvent(null);
      setAlert('✓ ' + err.message);
      setTimeout(() => setAlert(''), 5000);
    },
  });

  const [eventConfirmHandler, { loading: creatEventLoading }] = useMutation(CREATE_EVENT, {
    onError: (error) => {
      setCreating(false);
      setAlert(error.message);
      setTimeout(() => setAlert(''), 5000);
    },
    onCompleted: () => {
      setCreating(false);
      setAlert('تم إضافة المناسبة');
      setTimeout(() => setAlert(''), 3000);
        client.refetchQueries({ 
            include: ['Events'] 
        });
    }
  });

  const shouldShowSpinner = showInitialSpinner || (loading && !data);

  if (error && !shouldShowSpinner) return <p>Error: {error.message}</p>;

  const showDetailHandler = (eventId) => {
    const event = data.events.find(e => e._id === eventId);
    setSelectedEvent(event);
  };

  

  const selectedCreatorId = selectedEvent?.creator?._id || selectedEvent?.creator;
  const isEventOwner =
    Boolean(value.userId) &&
    Boolean(selectedCreatorId) &&
    String(selectedCreatorId) === String(value.userId);

  const confirmHandler = () => {
    if (!value.token) {
      setSelectedEvent(null);
      navigate('/login');
      return;
    }
    bookEvent({ variables: { eventId: selectedEvent._id } });
  };



  return (
    <>
        <Error error={alert} type='success' />
      {selectedEvent && (
        <SimpleModal
          title='حجز مناسبة'
          onCancel={() => setSelectedEvent(null)}
          onConfirm={confirmHandler}
          confirmText={
            isEventOwner
              ? 'انت صاحب هذه المناسبة'
              : value.token ? 'احجز' : 'سجل دخول للحجز'
          }
          isDisabled={isEventOwner || bookingLoading}
        >
          <h4 className='mb-4'>{selectedEvent.title}</h4>
          <h4 className='mb-4'>
            ${selectedEvent.price} -{' '}
            {selectedEvent.date.split('.')[0]}
          </h4>
          <p>{selectedEvent.description}</p>
        </SimpleModal>
      )}
      {value.token && (
        <div className='events-control pt-2 text-center pb-3'>
          <h2>شارك مناسباتك الخاصة!</h2>
          <button className='btn' onClick={() => setCreating(true)}>إنشاء مناسبة</button>
        </div>
      )}
      {creating && (
        <SimpleModal
          title='إضافة مناسبة'
          onCancel={() => setCreating(false)}
          onConfirm={()  => {
            if (
              title.trim().length === 0 ||
              price <= 0 ||
              date.trim().length === 0 ||
              description.trim().length === 0
            ) {
              setModalAlert('يجب ملئ جميع الحقول بالشكل الصحيح!');
              return;
            }
            setModalAlert('');
            eventConfirmHandler({
              variables: {
                title: title.trim(),
                price: parseFloat(price),
                date: new Date(date).toISOString(),
                description: description.trim(),
              },
            });
          }}
          confirmText='إضافة'
          isDisabled={creatEventLoading}
        >
          <form>
            <Error error={modalAlert} type='success' />
            <div className='form-control mb-3'>
              <label htmlFor='title'>العنوان</label>
              <input type='text' id='title' required
                value={title}
                onChange={({ target }) => setTitle(target.value)}
              />
            </div>
            <div className='form-control mb-3'>
              <label htmlFor='price'>السعر</label>
              <input type='number' id='price' required
                value={price}
                onChange={({ target }) => setPrice(target.value)}
              />
            </div>
            <div className='form-control mb-3'>
              <label htmlFor='date'>التاريخ</label>
              <input type='datetime-local' id='date' required
                value={date}
                onChange={({ target }) => setDate(target.value)}
              />
            </div>
            <div className='form-control mb-3'>
              <label htmlFor='description'>التفاصيل</label>
              <textarea id='description' rows='4' required
                value={description}
                onChange={({ target }) => setDescription(target.value)}
              />
            </div>
          </form>
        </SimpleModal>
      )}
      <div className="container-fluid">
        <h2 className='mb-3 text-center'>!المناسبات من حولك</h2>
        <div className="row justify-content-center">
          {shouldShowSpinner ? (
            <Spinner />
          ) : (
            data?.events?.map(({ _id, title, description, price, date, creator }) => (
              <EventItem
                key={_id}
                _id={_id}
                title={title}
                description={description}
                price={price}
                date={date}
                creator={creator}
                onDetail={showDetailHandler}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default function EventsPage() {
  return <EventList />;
}