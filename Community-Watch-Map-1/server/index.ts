import { spawn } from "child_process";

console.log("Starting Python Flask app...");

// Spawn the Python process
const pythonProcess = spawn("python", ["app.py"], {
  stdio: "inherit",
});

pythonProcess.on("error", (err) => {
  console.error("Failed to start Python process:", err);
});

pythonProcess.on("close", (code) => {
  console.log(`Python process exited with code ${code}`);
  process.exit(code ?? 0);
});
