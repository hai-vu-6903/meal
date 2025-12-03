import { useState } from 'react';
import { login } from '../services/authService';

export default function Login(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  // const handleSubmit = async (e)=>{
  //   e.preventDefault();
  //   const res = await login(email,password);
  //   localStorage.setItem('token',res.token);
  //   if(res.user.role==='Admin') window.location.href='/admin';
  //   else if(res.user.role==='Manager') window.location.href='/manager';
  //   else window.location.href='/soldier';
  // };

  const handleSubmit = async (e)=>{
  e.preventDefault();
  const res = await login(email,password);
  localStorage.setItem('token',res.token);
  localStorage.setItem('userRole',JSON.stringify(res.user.role)); // Lưu role

  if(res.user.role==='Admin') window.location.href='/admin';
  else if(res.user.role==='Manager') window.location.href='/manager';
  else window.location.href='/soldier';
};


  return (
    // <form onSubmit={handleSubmit}>
    //   <label htmlFor="">Quản lý suất ăn</label>
    //   <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
    //   <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/>
    //   <button type="submit">Đăng nhập</button>
    // </form>

    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Quản lý suất ăn</h2>

        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Nhập email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
