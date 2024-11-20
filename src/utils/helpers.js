export const filterAndSortData = (data, search, filter, sort) => {
    const searchTerm = search.toLowerCase();

    return data
      .filter((item) => {
        // Filter by search term and location filter
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.location.toLowerCase().includes(searchTerm);

        const matchesFilter = filter ? item.location === filter : true;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sort === 'price') return a.price - b.price;
        if (sort === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  };
