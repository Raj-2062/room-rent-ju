const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : 'https://room-rent-ju.onrender.com';

const WS_BASE_URL = window.location.hostname === 'localhost'
  ? 'ws://localhost:8000'
  : 'wss://room-rent-ju.onrender.com';

// Fetch properties with filters & sorting
export const fetchProperties = async (filters = {}) => {
  const {
    area = 'all',
    property_type = 'all',
    gender = 'all',
    min_price = 0,
    max_price = 100000,
    sort_by = 'newest'
  } = typeof filters === 'string' ? { area: filters } : filters;

  const queryParams = new URLSearchParams({
    area,
    property_type,
    gender,
    min_price: min_price.toString(),
    max_price: max_price.toString(),
    sort_by
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/properties?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch properties');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

// WebSocket Helper for Real-Time Property Chat
export const connectChatWebSocket = (conversationId, onMessageReceived) => {
  const socket = new WebSocket(`${WS_BASE_URL}/ws/chat/${conversationId}`);

  socket.onopen = () => {
    console.log(`Connected to chat WebSocket for conversation #${conversationId}`);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessageReceived(data);
    } catch (e) {
      console.error('WebSocket payload parse error:', e);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };

  socket.onclose = () => {
    console.log(`Chat WebSocket closed for conversation #${conversationId}`);
  };

  return socket;
};