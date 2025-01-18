// ! 원래 공식 홈페이지의 설명은 chroma 자체를 import하라고 되어있지만 해당 방식으로 진행시 undefined 에러
// ! 따라서 필요한 메소드만 가져와 사용
import { random, contrast } from 'chroma-js';

export function generateColorStyle() {
  const color = random().hex('rgb');
  if (contrast(color, 'fff') > 4.5) {
    return { bg_color: color, text_color: '#FFFFFF' };
  } else if (contrast(color, '000') > 4.5) {
    return { bg_color: color, text_color: '#000000' };
  } else return generateColorStyle();
}
