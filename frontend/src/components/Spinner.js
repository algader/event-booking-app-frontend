import { Puff } from 'react-loader-spinner';

export const Spinner = () => (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
            <Puff
                height="100"
                width="100"
                color="#cc6600"
                ariaLabel="page-loading"
        />
    </div>
)
export default Spinner;