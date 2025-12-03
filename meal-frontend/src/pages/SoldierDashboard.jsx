// import { useEffect,useState } from 'react';
// import { getMeals } from '../services/mealService';
// import MealForm from '../components/MealForm';

// export default function SoldierDashboard(){
//   const [meals,setMeals] = useState([]);
//   const userId = 3; // Soldier ID demo
//   useEffect(()=>{getMeals().then(setMeals)},[]);
//   return (
//     <div>
//       <h1>Quân Nhân Dashboard</h1>
//       <MealForm userId={userId}/>
//       <h2>Danh sách suất ăn</h2>
//       <table border="1">
//         <thead><tr><th>Ngày</th><th>Suất ăn</th></tr></thead>
//         <tbody>
//           {meals.filter(m=>m.user_name==='QuanNhan1').map(m=>(
//             <tr key={m.id}><td>{m.date}</td><td>{m.meal_type}</td></tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { getMeals } from '../services/mealService';
import MealForm from '../components/MealForm';

export default function SoldierDashboard() {
  const [meals, setMeals] = useState([]);
  const userId = 3; // Soldier ID demo

  const fetchMeals = () => {
    getMeals().then((data) => {
      const userMeals = data.filter(m => m.user_name === 'QuanNhan1');

      // Gom nhóm theo ngày
      const grouped = userMeals.reduce((acc, meal) => {
        const dateOnly = meal.date; // lấy trực tiếp từ API, cột DATE
        if (!acc[dateOnly]) acc[dateOnly] = [];
        acc[dateOnly].push(meal.meal_type);
        return acc;
      }, {});

      const sortedMeals = Object.entries(grouped)
        .map(([date, mealTypes]) => ({
          date,
          mealTypes: [...new Set(mealTypes)]
        }))
        .sort((a, b) => a.date.localeCompare(b.date)); // ngày tăng dần

      setMeals(sortedMeals);
    });
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <div>
      <h1>Quân Nhân Dashboard</h1>
      <MealForm userId={userId} refreshMeals={fetchMeals} />
      <h2>Danh sách suất ăn</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Suất ăn</th>
          </tr>
        </thead>
        <tbody>
          {meals.map((m) => (
            <tr key={m.date}>
              <td>{m.date.split('-').reverse().join('/')}</td> {/* dd/mm/yyyy */}
              <td>{m.mealTypes.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
