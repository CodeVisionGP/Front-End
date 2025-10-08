const BASE_URL = "http://localhost:8000/api/restaurants";

export async function getItems(restaurantId) {
  const res = await fetch(`${BASE_URL}/${restaurantId}/items`);
  return await res.json();
}
