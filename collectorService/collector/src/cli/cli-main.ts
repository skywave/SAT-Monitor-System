import { startDashboard } from './dashboard';

console.log('Starting SAT Monitor Dashboard...');
startDashboard().catch((err) => {
  console.error('Dashboard failed to start:', err);
  process.exit(1);
});
