import "dotenv/config";
import app from "../api/index.js";

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`Merchant's Delight API listening on http://localhost:${PORT}`);
});
