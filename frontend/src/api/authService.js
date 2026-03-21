export const loginUser = async (username, password) => {
  // Simple mock for now
  if (username === 'collector' && password === 'admin123') {
    return {
      message: "Login Successful",
      role: "ADMIN",
      user: {
        name: "SUDARSHAN SHAHARE",
        email: "collector@amravati.gov.in"
      }
    };
  }
  return { message: "Invalid credentials" };
};

export const logoutUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};
