import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { CREATE_USER } from './queries';
import AuthContext from '../context/auth-context';
import Error from '../components/Error';
import Spinner from '../components/Spinner';

export default function SignUpPage() {
    const value = useContext(AuthContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alert, setAlert ] = useState('');
    const [alertType, setAlertType] = useState('success');

    const [createUser, { loading, error }] = useMutation(CREATE_USER, {
        onError: (apolloError) => {
            const message =
                apolloError?.graphQLErrors?.[0]?.message ||
                apolloError?.message ||
                'حدث خطأ أثناء إنشاء الحساب';
            setAlertType('success');
            setAlert(message);
        },
        onCompleted: ({ createUser: createdUser }) => {
            if (createdUser?.userId) {
                console.log('Created user:', createdUser);
                console.log('Signup token:', createdUser.token);
                value.login(createdUser.token, createdUser.userId, createdUser.username);
                setSuccessMessage('تم إنشاء الحساب بنجاح');
                setAlertType('success');
                setAlert('تم إنشاء الحساب بنجاح');
                navigate('/events');
            }
        },
    });

    const submitHandler = async (event) => {
        event.preventDefault();
        setSuccessMessage('');
        setAlert('');

        try {
            await createUser({
                variables: {
                    username: username.trim(),
                    email: email.trim(),
                    password: password.trim(),
                },
            });
        } catch (_) {
            // onError above already updates UI message.
        }
    };

    return (
        <form className="auth-form login-form" onSubmit={submitHandler}>
                <Error error={alert} type={alertType} />
            <div className="form-control">
                <label htmlFor="name">اسم المستخدم</label>
                <input
                value={username}
                onChange={({ target }) => setUsername(target.value)}
                    id="name"
                    type="text"
                    required
                />
            </div>

            <div className="form-control">
                <label htmlFor="email">البريد الالكتروني</label>
                <input
                    value={email}
                    onChange={({ target }) => setEmail(target.value)}
                    id="email"
                    type="email"
                    required
                />
            </div>

            <div className="form-control">
                <label htmlFor="password">كلمة المرور</label>
                <input
                    value={password}
                    onChange={({ target }) => setPassword(target.value)}
                    id="password"
                    type="password"
                    required
                />
            </div>

            <div className="form-actions">
                <button className="btn m-2" type="submit" disabled={loading}>
                    {loading ? 'جاري الإنشاء...' : 'إرسال'}
                </button>
            </div>

            {loading && <Spinner />}

            {error && null}
            {successMessage && <p>{successMessage}</p>}
        </form>
    );
}

