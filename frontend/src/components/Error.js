import React from 'react';

const normalizeAlertType = (type) => {
    if (!type) return 'danger';
    if (type === 'error') return 'danger';
    return type;
};

export default function Error({ error, type }) {
    if (!error) return null;

    return (
        <div className={`alert alert-${normalizeAlertType(type)}`} role="alert">
            {error}
        </div>
    );
}
