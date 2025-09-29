import evaluationWorker from './evaluationWorker';

console.log('Worker process started and is listening for jobs... 🚀');

// Function to handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down worker...');
  // The close() method waits for current jobs to finish
  await evaluationWorker.close();
  console.log('Worker has been closed.');
  process.exit(0);
};

// Listen for termination signals
process.on('SIGINT', shutdown); // Catches Ctrl+C
process.on('SIGTERM', shutdown); // Catches kill/stop commands (like from Docker)

// This keeps the process running indefinitely.
// The process will now only exit when it receives a SIGINT or SIGTERM signal.
new Promise(() => {});
