require("dotenv").config();
const app = require("./app");

// Use Render's dynamic port or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});