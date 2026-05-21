import React from 'react';

export default function SimpleModal({ title, children, onConfirm, onCancel, confirmText, isDisabled }) {
	return (
		<>
			<div className="modal show d-block custom-modal" tabIndex="-1" role="dialog">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header custom-modal-header">
							<h5 className="modal-title">{title}</h5>
							<button type="button" className="btn-close" onClick={onCancel}></button>
						</div>
						<div className="modal-body">
							{children}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-primary" onClick={onConfirm} disabled={isDisabled}>
								{confirmText}
							</button>
							<button type="button" className="btn btn-secondary" onClick={onCancel}>
								إغلاق
							</button>
						</div>
					</div>
				</div>
			</div>
			<div className="modal-backdrop show"></div>
		</>
	);
}
