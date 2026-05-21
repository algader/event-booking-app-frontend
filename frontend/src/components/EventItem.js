import React ,  { useContext } from 'react';
import AuthContext from '../context/auth-context';
export default function EventItem({ _id, title, price, date, description, creator, onDetail }) {
	const value = useContext(AuthContext);
	const creatorId = creator?._id || creator;
	const isCreator =
		Boolean(value.userId) &&
		Boolean(creatorId) &&
		String(value.userId) === String(creatorId);
	return ( 
		<div className="events-list-item col-md-4 col-lg-3 col-6">
			<div className="text-center align-items-center flex-column d-grid gap-3 h-100">
				<div className="p-2">
					<h1>{title}</h1>
				</div>

				<div className="p-3">
					<h2>${price} - {date.split('.')[0].split(' ')[0]}</h2>
				</div> 

				<div className="p-2"> 
					<button className="btn" onClick={ () => onDetail(_id)}> 
						{isCreator ? 'انت صاحب هذه المناسبة' : 'عرض التفاصيل'}
					</button>
				</div>
			</div>
		</div>
	);
}
