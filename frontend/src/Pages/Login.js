import React, { useContext, useEffect, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LOGIN } from './queries';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/auth-context';
import Error from '../components/Error';
import Spinner from '../components/Spinner';



export default function LoginPage() {
    const value = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alert, setAlert ] = useState('');
    const [alertType, setAlertType] = useState('success');
    const navigate = useNavigate();


    const [login, { loading, error, data }] = useMutation(LOGIN, {

        onCompleted: ({ login: loginResult }) => {
            if (loginResult?.token) {
                console.log('Login token:', loginResult.token);
                setSuccessMessage('تم تسجيل الدخول بنجاح');
            }
        },
        onError: (apolloError) => {
            const message =
                apolloError?.graphQLErrors?.[0]?.message ||
                apolloError?.message ||
                'حدث خطأ أثناء تسجيل الدخول';
            setAlertType('success');
            setAlert(message);
        },
    });

    useEffect(() => {
        if (!loading && data?.login) {
            const token = data.login.token;
            const userId = data.login.userId;
            const username = data.login.username;
    
            value.login(token, userId, username);
            navigate('/events');
        }
    }, [data, loading, navigate, value]);


    const submitHandler = async (event) => {
        event.preventDefault();
        setSuccessMessage('');
        setAlert('');

        try {
            await login({
                variables: {
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
                    {loading ? 'جاري التحقق...' : 'إرسال'}
                </button>
                <button className="btn m-2" type="button" onClick={() => navigate('/signup')}>
                     الانتقال الى انشاء حساب  
                </button>
            </div>

            {loading && <Spinner />}

            {error && null}
            {successMessage && <p>{successMessage}</p>}
        </form>
    );
    
}