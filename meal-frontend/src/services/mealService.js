import axios from 'axios';
const token = localStorage.getItem('token');

export const getMeals = async ()=>{
  const res = await axios.get('http://localhost:5000/api/meals',{headers:{Authorization:'Bearer '+token}});
  return res.data;
};

export const registerMeal = async (data)=>{
  const res = await axios.post('http://localhost:5000/api/meals/register',data,{headers:{Authorization:'Bearer '+token}});
  return res.data;
};
