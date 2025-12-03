import { useEffect, useState } from "react";
import { getMeals, registerMeal } from "../services/mealService";

export default function MealCalendar({ userId, onRegister }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedMeals, setSelectedMeals] = useState({}); // { 'Wed Dec 03 2025': ['Sáng', 'Trưa'] }
  const [registeredMeals, setRegisteredMeals] = useState({}); // same structure

  // Load các bữa ăn đã đăng ký từ backend
  useEffect(() => {
    async function fetchMeals() {
      try {
        const meals = await getMeals();
        const userMeals = {};
        meals
          .filter((m) => m.user_id === userId)
          .forEach((m) => {
            const d = new Date(m.date).toDateString();
            if (!userMeals[d]) userMeals[d] = [];
            userMeals[d].push(m.meal_type);
          });
        setRegisteredMeals(userMeals);
      } catch (err) {
        console.error(err);
      }
    }
    fetchMeals();
  }, [userId]);

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Tạo calendar
  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Thứ 2 = 0
    const daysInMonth = lastDay.getDate();

    const calendar = [];
    for (let i = 0; i < startDay; i++) calendar.push(null);
    for (let d = 1; d <= daysInMonth; d++)
      calendar.push(new Date(currentYear, currentMonth, d));
    return calendar;
  };

  const calendar = generateCalendar();

  const toggleMeal = (date, mealType) => {
    const d = date.toDateString();
    const dayMeals = selectedMeals[d] || [];
    if (dayMeals.includes(mealType)) {
      setSelectedMeals({
        ...selectedMeals,
        [d]: dayMeals.filter((m) => m !== mealType),
      });
    } else {
      setSelectedMeals({
        ...selectedMeals,
        [d]: [...dayMeals, mealType],
      });
    }
  };

  // Đăng ký các bữa ăn đã chọn
  const handleRegister = async () => {
    try {
      const newMealsForDashboard = []; // để trả về callback onRegister
      for (let dateStr in selectedMeals) {
        const dateObj = new Date(dateStr);
        const formattedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
        for (let mealType of selectedMeals[dateStr]) {
          await registerMeal({ user_id: userId, date: formattedDate, meal_type: mealType });
          newMealsForDashboard.push({ user_id: userId, date: formattedDate, meal_type: mealType });
        }
      }

      alert("Đăng ký thành công!");

      // Cập nhật registeredMeals
      const newRegistered = { ...registeredMeals };
      for (let dateStr in selectedMeals) {
        if (!newRegistered[dateStr]) newRegistered[dateStr] = [];
        newRegistered[dateStr] = [...new Set([...newRegistered[dateStr], ...selectedMeals[dateStr]])];
      }
      setRegisteredMeals(newRegistered);
      setSelectedMeals({});

      // Callback cập nhật ngay trong dashboard
      if (onRegister) onRegister(newMealsForDashboard);

    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đăng ký");
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  };

  // Chia calendar thành các tuần
  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  return (
    <div>
      <div>
        <button onClick={prevMonth}>&lt;</button>
        <span style={{ margin: "0 10px" }}>{currentMonth + 1}/{currentYear}</span>
        <button onClick={nextMonth}>&gt;</button>
      </div>

      <table border="1" cellPadding="5" cellSpacing="0" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            {daysOfWeek.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((date, j) => {
                if (!date) return <td key={j}></td>;

                const dStr = date.toDateString();
                const isToday = dStr === today.toDateString();
                const isPast = date < today && !isToday;

                const meals = ["Sáng", "Trưa", "Tối"];
                return (
                  <td key={j}>
                    <div>{date.getDate()}{isToday ? " (Hôm nay)" : ""}</div>
                    {meals.map((meal) => {
                      const isSelected = selectedMeals[dStr]?.includes(meal);
                      const isRegistered = registeredMeals[dStr]?.includes(meal);
                      let style = {};
                      if (isRegistered) style.backgroundColor = "green";
                      if (isSelected) style.backgroundColor = "blue";
                      if (isSelected || isRegistered) style.color = "white";
                      return (
                        <button
                          key={meal}
                          disabled={isPast}
                          onClick={() => toggleMeal(date, meal)}
                          style={{ margin: "2px", ...style }}
                        >
                          {meal}
                        </button>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleRegister}>Đăng ký các bữa ăn đã chọn</button>
      </div>
    </div>
  );
}
