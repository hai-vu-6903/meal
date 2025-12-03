const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách tất cả người dùng
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, role FROM users');
    res.json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
