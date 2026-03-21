type JobTask = () => Promise<void>;

interface QueuedTask {
  run: JobTask;
  attempts: number;
}

const queue: QueuedTask[] = [];
const MAX_CONCURRENCY = 3;
const MAX_RETRIES = 2;
const RETRY_BACKOFF_MS = 400;
let activeWorkers = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWorker() {
  const task = queue.shift();
  if (!task) {
    return;
  }

  activeWorkers += 1;

  try {
    await task.run();
  } catch {
    if (task.attempts < MAX_RETRIES) {
      await sleep(RETRY_BACKOFF_MS * (task.attempts + 1));
      queue.push({
        run: task.run,
        attempts: task.attempts + 1,
      });
    }
  } finally {
    activeWorkers -= 1;
    void scheduleWorkers();
  }
}

async function scheduleWorkers() {
  while (activeWorkers < MAX_CONCURRENCY && queue.length > 0) {
    void runWorker();
  }
}

export function enqueue(task: JobTask) {
  queue.push({ run: task, attempts: 0 });
  void scheduleWorkers();
}
