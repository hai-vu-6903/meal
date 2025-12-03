const pool = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req,res)=>{
  const {email,password} = req.body;
  try{
    const [rows] = await pool.query('SELECT * FROM users WHERE email=?',[email]);
    if(!rows.length) return res.status(400).json({message:'Email không tồn tại'});

    const user = rows[0];
    if(password !== user.password) return res.status(400).json({message:'Sai mật khẩu'});

    const token = jwt.sign({id:user.id,role:user.role,email:user.email}, process.env.JWT_SECRET || 'secretkey',{expiresIn:'8h'});
    res.json({token,user:{id:user.id,name:user.name,role:user.role,email:user.email}});
  }catch(err){
    res.status(500).json({message:err.message});
  }
};
