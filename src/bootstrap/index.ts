import * as core from "@actions/core";

const hasErrorMessage = (e: unknown): e is { message: string | Error } => {
  return typeof e === "object" && e !== null && "message" in e;
};

const run = async (fn: () => unknown | Promise<unknown>): Promise<void> => {
  try {
    await fn();
  } catch (e) {
    process.stderr.write("Error: ");
    if (hasErrorMessage(e)) {
      core.setFailed(e.message);
    } else if (e instanceof Error) {
      core.setFailed(e.message);
    } else {
      core.setFailed(String(e));
    }
  }
};

export { run };
