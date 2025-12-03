const express = require('express');
const router = express.Router();
const {registerMeal,getMeals} = require('../controllers/mealController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register',authMiddleware,roleMiddleware(['Admin','Manager','Soldier']),registerMeal);
router.get('/',authMiddleware,roleMiddleware(['Admin','Manager','Soldier']),getMeals);

module.exports = router;
