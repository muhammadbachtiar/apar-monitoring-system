const LogOutHandle = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('role');
};

export default LogOutHandle