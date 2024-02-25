export function parseDuration(duration) {
  const matches = duration.match(/^(\d+)(d|h|m)$/);
  if (!matches) return null;

  const value = parseInt(matches[1], 10);
  const unit = matches[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000; // 일 -> 밀리초
    case 'h':
      return value * 60 * 60 * 1000; // 시간 -> 밀리초
    case 'm':
      return value * 60 * 1000; // 분 -> 밀리초
    default:
      return null;
  }
}
