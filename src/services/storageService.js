export const listAllStorages = async () => {
    const apiUrl = 'https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/list-storage-location';
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch storage locations.');
    }
    return response.json(); // Return JSON data
  };

  export const listAvailableStorages = async (startDate, endDate) => {
    const apiUrl = `https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/storage-location/list-storage-location-available-date-range?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch available storages');
    return await response.json();
  };

