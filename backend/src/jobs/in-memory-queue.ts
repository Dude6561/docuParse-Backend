type JobTask = () => Promise<void>;

const queue: JobTask[] = [];
let processing = false;

async function runNext() {
  const task = queue.shift();
  if (!task) {
    processing = false;
    return;
  }

  try {
    await task();
  } finally {
    await runNext();
  }
}

export function enqueue(task: JobTask) {
  queue.push(task);
  if (!processing) {
    processing = true;
    void runNext();
  }
}
