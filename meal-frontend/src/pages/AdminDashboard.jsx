import { useEffect,useState } from 'react';
import { getMeals } from '../services/mealService';
import { exportExcel } from '../utils/excelExport';

export default function AdminDashboard(){
  const [meals,setMeals] = useState([]);
  useEffect(()=>{getMeals().then(setMeals)},[]);
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={()=>exportExcel(meals)}>Xuất Excel</button>
      <table border="1">
        <thead><tr><th>Người dùng</th><th>Ngày</th><th>Suất ăn</th></tr></thead>
        <tbody>
          {meals.map(m=>(
            <tr key={m.id}><td>{m.user_name}</td><td>{m.date}</td><td>{m.meal_type}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
