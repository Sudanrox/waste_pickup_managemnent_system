export const registerUser = (req, res) => {
  const { name, email, password } = req.body;
  // Dummy user creation simulation
  res.status(201).json({ message: `User ${name} registered successfully` });
};

export const loginUser = (req, res) => {
  const { email } = req.body;
  res.json({ message: `Welcome back ${email}` });
};
