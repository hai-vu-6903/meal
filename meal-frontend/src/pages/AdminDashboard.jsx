import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getMeals, getUsers } from '../services/mealService';
import { exportExcel } from '../utils/excelExport';
import { Card, Row, Col, Statistic } from 'antd';

export default function AdminDashboard() {
  const [managerMeals, setManagerMeals] = useState([]);
  const [soldierMeals, setSoldierMeals] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayMeals, setTodayMeals] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        console.log('Đang tải dữ liệu...');
        
        // Lấy danh sách người dùng
        const users = await getUsers();
        console.log('Danh sách người dùng:', users);
        
        // Lấy dữ liệu bữa ăn
        const mealsData = await getMeals();
        console.log('Dữ liệu bữa ăn:', mealsData);
        
        if (isMounted) {
          // Cập nhật tổng số tài khoản
          setTotalUsers(Array.isArray(users) ? users.length : 0);
          
          // Xử lý dữ liệu bữa ăn
          if (Array.isArray(mealsData)) {
            const today = new Date().toISOString().split('T')[0];
            const todayMealsCount = {
              breakfast: 0,
              lunch: 0,
              dinner: 0
            };
            
            mealsData.forEach(meal => {
              if (!meal || !meal.date) return;
              
              const mealDate = typeof meal.date === 'string' 
                ? meal.date.split('T')[0]
                : new Date(meal.date).toISOString().split('T')[0];
                
              if (mealDate === today) {
                if (meal.meal_type === 'sang') todayMealsCount.breakfast++;
                else if (meal.meal_type === 'trua') todayMealsCount.lunch++;
                else if (meal.meal_type === 'toi') todayMealsCount.dinner++;
              }
            });
            
            console.log('Số suất ăn hôm nay:', todayMealsCount);
            setTodayMeals(todayMealsCount);
            
            // Phân loại dữ liệu cho bảng
            const managerData = mealsData.filter(meal => meal.user_name && meal.user_name.includes('QuanLy'));
            const soldierData = mealsData.filter(meal => meal.user_name && meal.user_name.includes('QuanNhan'));
            
            const groupMeals = (meals) => {
              const grouped = {};
              meals.forEach(meal => {
                if (!meal || !meal.date) return;
                
                const mealDate = typeof meal.date === 'string' 
                  ? meal.date.split('T')[0] 
                  : new Date(meal.date).toISOString().split('T')[0];
                  
                const key = `${meal.user_id}_${mealDate}`;
                
                if (!grouped[key]) {
                  grouped[key] = {
                    id: key,
                    user_id: meal.user_id,
                    user_name: meal.user_name,
                    date: mealDate,
                    mealTypes: []
                  };
                }
                
                if (meal.meal_type && !grouped[key].mealTypes.includes(meal.meal_type)) {
                  grouped[key].mealTypes.push(meal.meal_type);
                }
              });
              
              return Object.values(grouped).sort((a, b) => 
                new Date(a.date) - new Date(b.date)
              );
            };
            
            setManagerMeals(groupMeals(managerData));
            setSoldierMeals(groupMeals(soldierData));
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        if (isMounted) {
          setError('Có lỗi xảy ra khi tải dữ liệu');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const exportAllData = () => {
    const allData = [...managerMeals, ...soldierMeals];
    exportExcel(allData);
  };

  // Lấy ngày hiện tại và định dạng theo tiếng Việt
  const currentDate = new Date();
  const formattedDate = format(currentDate, 'EEEE, dd/MM/yyyy', { locale: vi });

  // Hiển thị loading hoặc lỗi nếu cần
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column'
      }}>
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        color: 'red'
      }}>
        <div style={{ marginBottom: '1rem' }}>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px',
          fontWeight: 'bold',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {formattedDate}
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Tổng số tài khoản" 
              value={totalUsers} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Sáng nay" 
              value={todayMeals.breakfast} 
              suffix="suất"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Trưa nay" 
              value={todayMeals.lunch} 
              suffix="suất"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Tối nay" 
              value={todayMeals.dinner} 
              suffix="suất"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Export Button */}
      <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
        <button 
          onClick={exportAllData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Xuất Excel tất cả dữ liệu
        </button>
      </div>

      {/* Manager Table */}
      <div style={{ marginBottom: '2rem', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Quản lý</h2>
          <button 
            onClick={() => exportExcel(managerMeals)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Xuất Excel Quản lý
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Người dùng</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Ngày</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Suất ăn</th>
              </tr>
            </thead>
            <tbody>
              {managerMeals.length > 0 ? (
                managerMeals.map((meal, index) => (
                  <tr 
                    key={meal.id || index}
                    style={{ borderBottom: '1px solid #e8e8e8', backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}
                  >
                    <td style={{ padding: '0.75rem' }}>{meal.user_name || 'Không có tên'}</td>
                    <td style={{ padding: '0.75rem' }}>{meal.date || 'Không có ngày'}</td>
                    <td style={{ padding: '0.75rem' }}>{(meal.mealTypes && meal.mealTypes.length > 0) ? meal.mealTypes.join(', ') : 'Không có dữ liệu'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>Không có dữ liệu để hiển thị</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Soldier Table */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Quân nhân</h2>
          <button 
            onClick={() => exportExcel(soldierMeals)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Xuất Excel Quân nhân
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Người dùng</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Ngày</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Suất ăn</th>
              </tr>
            </thead>
            <tbody>
              {soldierMeals.length > 0 ? (
                soldierMeals.map((meal, index) => (
                  <tr 
                    key={meal.id || index}
                    style={{ borderBottom: '1px solid #e8e8e8', backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}
                  >
                    <td style={{ padding: '0.75rem' }}>{meal.user_name || 'Không có tên'}</td>
                    <td style={{ padding: '0.75rem' }}>{meal.date || 'Không có ngày'}</td>
                    <td style={{ padding: '0.75rem' }}>{(meal.mealTypes && meal.mealTypes.length > 0) ? meal.mealTypes.join(', ') : 'Không có dữ liệu'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>Không có dữ liệu để hiển thị</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}