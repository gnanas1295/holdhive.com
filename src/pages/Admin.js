import React, { useState } from 'react';

const Admin = () => {
  const [storageUnits, setStorageUnits] = useState([
    { id: 1, title: 'Storage A', description: 'Affordable unit', price: 50, location: 'City A' },
    { id: 2, title: 'Storage B', description: 'Spacious unit', price: 75, location: 'City B' },
    { id: 3, title: 'Storage C', description: 'Secure unit', price: 100, location: 'City C' },
  ]);

  const [form, setForm] = useState({ id: null, title: '', description: '', price: '', location: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.id) {
      // Update
      setStorageUnits((prev) =>
        prev.map((unit) => (unit.id === form.id ? { ...unit, ...form } : unit))
      );
    } else {
      // Create
      setStorageUnits((prev) => [
        ...prev,
        { ...form, id: Date.now(), price: parseFloat(form.price) },
      ]);
    }
    setForm({ id: null, title: '', description: '', price: '', location: '' });
  };

  const handleEdit = (unit) => {
    setForm(unit);
  };

  const handleDelete = (id) => {
    setStorageUnits((prev) => prev.filter((unit) => unit.id !== id));
  };

  return (
    <div className="container my-4">
      <h1 className="text-center">Admin Panel</h1>
      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {form.id ? 'Update Storage' : 'Add Storage'}
            </button>
          </form>
        </div>
        <div className="col-md-6">
          <h3>Storage Units</h3>
          <ul className="list-group">
            {storageUnits.map((unit) => (
              <li key={unit.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h5>{unit.title}</h5>
                  <p>{unit.description}</p>
                  <p>
                    <strong>Price:</strong> ${unit.price} | <strong>Location:</strong> {unit.location}
                  </p>
                </div>
                <div>
                  <button className="btn btn-sm btn-warning mx-1" onClick={() => handleEdit(unit)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(unit.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Admin;
