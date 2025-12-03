// import { useEffect,useState } from 'react';
// import { getMeals } from '../services/mealService';
// import { exportExcel } from '../utils/excelExport';
// import MealForm from '../components/MealForm';

// export default function ManagerDashboard(){
//   const [meals,setMeals] = useState([]);
//   const userId = 2; // Manager ID demo
//   useEffect(()=>{getMeals().then(setMeals)},[]);
//   return (
//     <div>
//       <h1>Manager Dashboard</h1>
//       <MealForm userId={userId}/>
//       <button onClick={()=>exportExcel(meals)}>Xuất Excel</button>
//       <table border="1">
//         <thead><tr><th>Người dùng</th><th>Ngày</th><th>Suất ăn</th></tr></thead>
//         <tbody>
//           {meals.map(m=>(
//             <tr key={m.id}><td>{m.user_name}</td><td>{m.date}</td><td>{m.meal_type}</td></tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { getMeals } from '../services/mealService';
import { exportExcel } from '../utils/excelExport';
import MealForm from '../components/MealForm';

export default function ManagerDashboard() {
  const [meals, setMeals] = useState([]);
  const userId = 2; // Manager ID demo

  const fetchMeals = () => {
    getMeals().then((data) => {
      // Gom nhóm theo user + ngày, lấy yyyy-mm-dd trực tiếp
      const grouped = data.reduce((acc, meal) => {
        const dateOnly = meal.date.split('T')[0];
        const key = `${meal.user_name}_${dateOnly}`;
        if (!acc[key]) acc[key] = { user_name: meal.user_name, date: dateOnly, mealTypes: [] };
        acc[key].mealTypes.push(meal.meal_type);
        return acc;
      }, {});

      const sortedMeals = Object.values(grouped)
        .map(item => ({ ...item, mealTypes: [...new Set(item.mealTypes)] }))
        .sort((a, b) => a.date.localeCompare(b.date)); // ngày tăng dần

      setMeals(sortedMeals);
    });
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <div>
      <h1>Manager Dashboard</h1>

      <MealForm userId={userId} refreshMeals={fetchMeals} />

      <button onClick={() => exportExcel(meals)}>Xuất Excel</button>

      <table border="1">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Ngày</th>
            <th>Suất ăn</th>
          </tr>
        </thead>
        <tbody>
          {meals.map((m, index) => (
            <tr key={index}>
              <td>{m.user_name}</td>
              <td>{m.date.split('-').reverse().join('/')}</td>
              <td>{m.mealTypes.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
