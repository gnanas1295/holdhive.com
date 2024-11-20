import React, { useState } from 'react';
import StorageList from '../components/StorageList';

const Home = () => {
  const [days, setDays] = useState(1);

  return (
    <div className="container">
      <h1 className="text-center my-4">Find Your Perfect Storage Space</h1>
      <div className="text-center mb-4">
        <label htmlFor="days" className="mr-2">
          Days to Rent:
        </label>
        <input
          type="number"
          id="days"
          value={days}
          onChange={(e) => setDays(Math.max(1, e.target.value))}
          min="1"
          className="form-control w-25 d-inline-block"
        />
      </div>
      <StorageList days={days} />
    </div>
  );
};

export default Home;
