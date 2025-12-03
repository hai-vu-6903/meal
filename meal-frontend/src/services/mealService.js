import axios from 'axios';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMeals = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/meals', { 
      headers: getAuthHeader() 
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu bữa ăn:', error);
    throw error;
  }
};

export const registerMeal = async (data) => {
  try {
    const res = await axios.post('http://localhost:5000/api/meals/register', data, { 
      headers: getAuthHeader() 
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký bữa ăn:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/users', {
      headers: getAuthHeader()
    });
    console.log('Users API response:', res.data);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    // Nếu lỗi 401 (Unauthorized), có thể đăng xuất người dùng
    if (error.response && error.response.status === 401) {
      // Xử lý đăng xuất hoặc làm mới token ở đây nếu cần
      localStorage.removeItem('token');
    }
    return [];
  }
};
