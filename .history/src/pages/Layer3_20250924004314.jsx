import React from 'react';

export default function Layer3({ show, fileUploaded, render }) {
  if (!show || !fileUploaded) return null;
  return (
    <div className="content-section active">
      {typeof render === 'function' ? render() : null}
    </div>
  );
}


