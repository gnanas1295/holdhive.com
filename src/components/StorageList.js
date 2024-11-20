import React, { useState } from 'react';
import StorageItem from './StorageItem';
import BookingForm from './BookingForm';

const dummyData = [
  { id: 1, title: 'Storage A', description: 'Affordable unit', price: 50, location: 'City A' },
  { id: 2, title: 'Storage B', description: 'Spacious unit', price: 75, location: 'City B' },
  { id: 3, title: 'Storage C', description: 'Secure unit', price: 100, location: 'City C' },
];

const StorageList = () => {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredData = dummyData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        className="form-control my-3"
        placeholder="Search Storage Units"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="d-flex flex-wrap justify-content-center">
        {filteredData.map((item) => (
          <StorageItem key={item.id} item={item} onBook={setSelectedItem} />
        ))}
      </div>
      {selectedItem && (
        <BookingForm
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default StorageList;
