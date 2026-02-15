import app from "./app";
import { consumeCoreAnswers } from "./queue/consumer";

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Express server running at http://localhost:${PORT}`);

  await consumeCoreAnswers();
});
