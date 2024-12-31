const BASE_URL = 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/rental-service';

export const listAllRentals = async () => {
  const response = await fetch(`${BASE_URL}/list-all-rentals`);
  if (!response.ok) throw new Error('Failed to fetch all rentals');
  return response.json();
};

export const listRentalById = async (rentalId) => {
  const response = await fetch(`${BASE_URL}/list-rental-by-rental-id?rental_id=${rentalId}`);
  if (!response.ok) throw new Error('Failed to fetch rental by ID');
  return response.json();
};

export const listRentalByStorageId = async (storageId) => {
  const response = await fetch(`${BASE_URL}/list-rental-by-storage-id?storage_id=${storageId}`);
  if (!response.ok) throw new Error('Failed to fetch rentals by storage ID');
  return response.json();
};

export const listRentalByRenterId = async (renterId) => {
  const response = await fetch(`${BASE_URL}/list-rental-by-renter-id?renter_id=${renterId}`);
  if (!response.ok) throw new Error('Failed to fetch rentals by renter ID');
  return response.json();
};

export const listRentalByOwnerId = async (ownerId) => {
  const response = await fetch(`${BASE_URL}/list-rental-by-owner-id?owner_id=${ownerId}`);
  if (!response.ok) throw new Error('Failed to fetch rentals by owner ID');
  return response.json();
};

export const createRental = async (rentalData) => {
  const response = await fetch(`${BASE_URL}/create-rental`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_rental', ...rentalData }),
  });
  if (!response.ok) throw new Error('Failed to create rental');
  return response.json();
};

export const deleteRental = async (rentalId) => {
  const response = await fetch(`${BASE_URL}/delete-rental`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete_rental', rental_id: rentalId }),
  });
  if (!response.ok) throw new Error('Failed to delete rental');
  return response.json();
};
