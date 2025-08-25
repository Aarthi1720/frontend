import React, { useState } from 'react';
import axios from 'axios';

const HotelImageUpload = ({ hotelId }) => {
  const [files, setFiles] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    await axios.post(`http://localhost:5000/api/hotels/${hotelId}/upload-image`, formData);
    alert('Images uploaded successfully');
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="text-lg font-semibold mb-2">Upload Hotel Images</h3>
      <input type="file" multiple onChange={e => setFiles([...e.target.files])} />
      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Upload</button>
    </div>
  );
};

export default HotelImageUpload;
