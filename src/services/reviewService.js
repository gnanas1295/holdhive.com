export const listReviews = async () => {
    const response = await fetch('https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/list-reviews');
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  };

  export const addReview = async (reviewData) => {
    const response = await fetch('https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/create-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_review',
        ...reviewData,
      }),
    });
    if (!response.ok) throw new Error('Failed to add review');
    return response.json();
  };

  export const updateReview = async (reviewId, updateData) => {
    const response = await fetch('https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/update-review-by-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_review',
        review_id: reviewId,
        ...updateData,
      }),
    });
    if (!response.ok) throw new Error('Failed to update review');
    return response.json();
  };

  export const deleteReview = async (reviewId) => {
    const response = await fetch('https://0ixtfa5608.execute-api.eu-west-1.amazonaws.com/prod/review-service/delete-review-by-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_review', review_id: reviewId }),
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return response.json();
  };
