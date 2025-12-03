// const pool = require('../config/db');

// exports.registerMeal = async (req,res)=>{
//   const {user_id,date,meal_type} = req.body;
//   try{
//     const [exists] = await pool.query('SELECT * FROM meals WHERE user_id=? AND date=? AND meal_type=?',[user_id,date,meal_type]);
//     if(exists.length) return res.status(400).json({message:'Đã đăng ký'});

//     await pool.query('INSERT INTO meals(user_id,date,meal_type) VALUES (?,?,?)',[user_id,date,meal_type]);
//     res.json({message:'Đăng ký thành công'});
//   }catch(err){
//     res.status(500).json({message:err.message});
//   }
// };

// exports.getMeals = async (req,res)=>{
//   try{
//     const [rows] = await pool.query(`SELECT meals.id, meals.date, meals.meal_type, users.name as user_name
//       FROM meals JOIN users ON meals.user_id = users.id ORDER BY meals.date DESC`);
//     res.json(rows);
//   }catch(err){
//     res.status(500).json({message:err.message});
//   }
// };


const pool = require('../config/db');

// Đăng ký suất ăn
exports.registerMeal = async (req, res) => {
  const { user_id, date, meal_type } = req.body;
  try {
    // Check đã đăng ký chưa, chỉ so sánh ngày thôi
    const [exists] = await pool.query(
      'SELECT * FROM meals WHERE user_id=? AND DATE(date)=? AND meal_type=?',
      [user_id, date, meal_type]
    );
    if (exists.length) return res.status(400).json({ message: 'Đã đăng ký' });

    await pool.query(
      'INSERT INTO meals(user_id, date, meal_type) VALUES (?, ?, ?)',
      [user_id, date, meal_type]
    );
    res.json({ message: 'Đăng ký thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách meals
exports.getMeals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT meals.id, meals.date, meals.meal_type, users.name AS user_name
      FROM meals
      JOIN users ON meals.user_id = users.id
      ORDER BY meals.date ASC
    `);
    res.json(rows); // meal.date bây giờ là chuỗi "YYYY-MM-DD"
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

