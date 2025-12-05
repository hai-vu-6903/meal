import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getMeals, getUsers } from '../services/mealService';
import { exportExcel } from '../utils/excelExport';
import { Card, Row, Col, Statistic, Table, Button, Modal, Form, Input, Select, DatePicker, Space, message, Popconfirm } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  ExportOutlined,
  UserOutlined,
  CalendarOutlined,
  CoffeeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AdminDashboard() {
  const [meals, setMeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  
  // Filters
  const [filters, setFilters] = useState({
    dateRange: null,
    mealType: null,
    userRole: null,
    searchText: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayBreakfast: 0,
    todayLunch: 0,
    todayDinner: 0,
    totalManagers: 0,
    totalSoldiers: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, meals]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mealsData, usersData] = await Promise.all([
        getMeals(),
        getUsers()
      ]);
      
      setMeals(mealsData || []);
      setUsers(usersData || []);
      calculateStats(mealsData || [], usersData || []);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (mealsData, usersData) => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayMeals = mealsData.filter(meal => {
      const mealDate = meal.date.split('T')[0];
      return mealDate === today;
    });

    setStats({
      totalUsers: usersData.length,
      todayBreakfast: todayMeals.filter(m => m.meal_type === 'sang').length,
      todayLunch: todayMeals.filter(m => m.meal_type === 'trua').length,
      todayDinner: todayMeals.filter(m => m.meal_type === 'toi').length,
      totalManagers: usersData.filter(u => u.role === 'Manager').length,
      totalSoldiers: usersData.filter(u => u.role === 'Soldier').length
    });
  };

  const applyFilters = () => {
    let filtered = [...meals];

    // Filter by date range
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(meal => {
        const mealDate = new Date(meal.date.split('T')[0]);
        return mealDate >= start && mealDate <= end;
      });
    }

    // Filter by meal type
    if (filters.mealType) {
      filtered = filtered.filter(meal => meal.meal_type === filters.mealType);
    }

    // Filter by user role
    if (filters.userRole) {
      const roleUsers = users.filter(u => u.role === filters.userRole);
      const roleUserIds = roleUsers.map(u => u.id);
      filtered = filtered.filter(meal => roleUserIds.includes(meal.user_id));
    }

    // Search by user name
    if (filters.searchText) {
      filtered = filtered.filter(meal => 
        meal.user_name?.toLowerCase().includes(filters.searchText.toLowerCase())
      );
    }

    setFilteredMeals(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: null,
      mealType: null,
      userRole: null,
      searchText: ''
    });
  };

  // User CRUD operations
  const handleAddUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    userForm.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id
    });
    setUserModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Xóa người dùng thành công');
      loadData();
    } catch (error) {
      message.error('Lỗi khi xóa người dùng: ' + error.message);
    }
  };

  const handleUserSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingUser 
        ? `http://localhost:5000/api/users/${editingUser.id}`
        : 'http://localhost:5000/api/users';
      
      const method = editingUser ? 'put' : 'post';
      
      await axios[method](url, values, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success(editingUser ? 'Cập nhật thành công' : 'Thêm người dùng thành công');
      setUserModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const handleExport = (data, filename) => {
    const exportData = data.map(meal => ({
      'Người dùng': meal.user_name,
      'Ngày': meal.date.split('T')[0],
      'Bữa ăn': meal.meal_type === 'sang' ? 'Sáng' : meal.meal_type === 'trua' ? 'Trưa' : 'Tối',
      'Thời gian tạo': meal.created_at
    }));
    exportExcel(exportData, filename);
    message.success('Xuất file Excel thành công');
  };

  // Table columns for meals
  const mealColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'user_name',
      key: 'user_name',
      sorter: (a, b) => (a.user_name || '').localeCompare(b.user_name || ''),
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => date ? date.split('T')[0] : '',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Bữa ăn',
      dataIndex: 'meal_type',
      key: 'meal_type',
      render: (type) => {
        const mealTypeMap = {
          'sang': { text: 'Sáng', color: '#52c41a' },
          'trua': { text: 'Trưa', color: '#faad14' },
          'toi': { text: 'Tối', color: '#722ed1' }
        };
        const meal = mealTypeMap[type] || { text: type, color: '#000' };
        return <span style={{ color: meal.color, fontWeight: 'bold' }}>{meal.text}</span>;
      },
      filters: [
        { text: 'Sáng', value: 'sang' },
        { text: 'Trưa', value: 'trua' },
        { text: 'Tối', value: 'toi' },
      ],
      onFilter: (value, record) => record.meal_type === value,
    }
  ];

  // Table columns for users
  const userColumns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleColors = {
          'Admin': '#f50',
          'Manager': '#2db7f5',
          'Soldier': '#87d068'
        };
        return <span style={{ color: roleColors[role] }}>{role}</span>;
      },
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Manager', value: 'Manager' },
        { text: 'Soldier', value: 'Soldier' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
            type="link"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const currentDate = format(new Date(), 'EEEE, dd/MM/yyyy', { locale: vi });

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Admin Dashboard</h1>
        <div style={{ 
          backgroundColor: '#1890ff', 
          color: 'white',
          padding: '8px 16px', 
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          <CalendarOutlined /> {currentDate}
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Tổng số tài khoản" 
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Sáng hôm nay" 
              value={stats.todayBreakfast}
              prefix={<CoffeeOutlined />}
              suffix="suất"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Trưa hôm nay" 
              value={stats.todayLunch}
              prefix={<CoffeeOutlined />}
              suffix="suất"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Tối hôm nay" 
              value={stats.todayDinner}
              prefix={<CoffeeOutlined />}
              suffix="suất"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Quản lý" 
              value={stats.totalManagers}
              valueStyle={{ color: '#2db7f5' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Quân nhân" 
              value={stats.totalSoldiers}
              valueStyle={{ color: '#87d068' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Users Management Section */}
      <Card 
        title="Quản lý người dùng" 
        style={{ marginBottom: '24px' }}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            Thêm người dùng
          </Button>
        }
      >
        <Table 
          columns={userColumns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Filters Section */}
      <Card title="Bộ lọc suất ăn" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm theo tên người dùng"
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker 
              style={{ width: '100%' }}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              value={filters.dateRange}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo bữa ăn"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('mealType', value)}
              value={filters.mealType}
              allowClear
            >
              <Option value="sang">Sáng</Option>
              <Option value="trua">Trưa</Option>
              <Option value="toi">Tối</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo vai trò"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('userRole', value)}
              value={filters.userRole}
              allowClear
            >
              <Option value="Manager">Quản lý</Option>
              <Option value="Soldier">Quân nhân</Option>
            </Select>
          </Col>
        </Row>
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Button onClick={clearFilters}>Xóa bộ lọc</Button>
        </div>
      </Card>

      {/* Meals Table */}
      <Card 
        title={`Danh sách suất ăn (${filteredMeals.length} suất)`}
        extra={
          <Space>
            <Button 
              type="primary"
              icon={<ExportOutlined />}
              onClick={() => handleExport(filteredMeals, 'danh-sach-suat-an.xlsx')}
            >
              Xuất Excel
            </Button>
          </Space>
        }
      >
        <Table 
          columns={mealColumns}
          dataSource={filteredMeals}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 20,
            showTotal: (total) => `Tổng ${total} suất ăn`
          }}
        />
      </Card>

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              <Option value="Manager">Quản lý</Option>
              <Option value="Soldier">Quân nhân</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department_id"
            label="Phòng ban"
          >
            <Select allowClear>
              <Option value={1}>Phòng A</Option>
              <Option value={2}>Phòng B</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setUserModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}