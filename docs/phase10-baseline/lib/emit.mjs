export function emit(criterion, pass, measured, error = null) {
  console.log(`machine-readable: ${JSON.stringify({ criterion, pass, measured, error })}`);
  process.exitCode = pass ? 0 : 1;
}
