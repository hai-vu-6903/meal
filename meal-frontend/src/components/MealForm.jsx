import { useState } from 'react';
import { registerMeal } from '../services/mealService';

export default function MealForm({ userId }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // JS getDay(): 0 = CN → đổi sang hệ: T2=0... CN=6
  const firstDayJS = new Date(year, month, 1).getDay();
  const firstDay = (firstDayJS + 6) % 7;

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const [selectedMeals, setSelectedMeals] = useState({});

  const toggleMeal = (day, mealType) => {
    setSelectedMeals(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: !prev[day]?.[mealType]
      }
    }));
  };

  const goPreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const toSend = [];

      Object.keys(selectedMeals).forEach(day => {
        const meals = selectedMeals[day];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
          day
        ).padStart(2, "0")}`;

        Object.keys(meals).forEach(mealType => {
          if (meals[mealType]) {
            toSend.push({
              user_id: userId,
              date: dateStr,
              meal_type: mealType
            });
          }
        });
      });

      for (let item of toSend) {
        await registerMeal(item);
      }

      alert("Đăng ký thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi");
    }
  };

  return (
    <div>
      <h3 style={{ textAlign: "center" }}>
        Đăng ký suất ăn tháng {month + 1}/{year}
      </h3>

      {/* Nút chuyển tháng */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          marginBottom: 10
        }}
      >
        <button onClick={goPreviousMonth}>← Tháng trước</button>
        <button onClick={goNextMonth}>Tháng sau →</button>
      </div>

      {/* Hàng thứ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 10
        }}
      >
        {weekDays.map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Lịch */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10
        }}
      >
        {/* Ô trống trước ngày 1 */}
        {[...Array(firstDay)].map((_, i) => (
          <div key={"empty" + i}></div>
        ))}

        {/* Ngày trong tháng */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;

          return (
            <div
              key={day}
              style={{ border: "1px solid black", padding: 5 }}
            >
              <strong>{day}</strong>

              {["Sáng", "Trưa", "Tối"].map(meal => (
                <button
                  key={meal}
                  onClick={() => toggleMeal(day, meal)}
                  style={{
                    display: "block",
                    marginTop: 5,
                    background: selectedMeals[day]?.[meal]
                      ? "lightgreen"
                      : "white"
                  }}
                >
                  {meal}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        style={{ marginTop: 20, padding: "10px 15px" }}
      >
        Đăng ký
      </button>
    </div>
  );
}
