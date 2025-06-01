import sanitize from 'sanitize-filename';

export function sanitizeFilename(original: string): string {
  // 1단계: 인코딩 변환 제거 (불필요한 경우)

  // 2단계: 기본 필터링
  let safeName = sanitize(original, { replacement: '_' });

  // 3단계: 유니코드 정규화 강화
  safeName = safeName.normalize('NFC');
  // .replace(/[\p{Diacritic}/gu, '')
  // .replace(/[^\w\-_.]/g, '_')
  // .replace(/_+/g, '_')
  // .replace(/^_+|_+$/g, '');

  // 4단계: 확장자 보존 길이 제한
  const MAX_LENGTH = 255;
  const extIndex = safeName.lastIndexOf('.');

  if (extIndex === -1) {
    return safeName.slice(0, MAX_LENGTH);
  }

  const ext = safeName.slice(extIndex);
  const base = safeName.slice(0, extIndex);
  const trimmedBase = base.slice(0, MAX_LENGTH - ext.length);

  return trimmedBase + ext;
}
