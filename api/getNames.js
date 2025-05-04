// api/getNames.js
export default function handler(req, res) {
  // 환경변수에서 이름 목록 가져오기
  const namesString = process.env.YOUTH_NAMES;
  const exclusionsString = process.env.EXCLUSION_PAIRS;

  if (!namesString) {
    return res.status(500).json({
      error: '환경변수에서 이름 목록을 찾을 수 없습니다.'
    });
  }

  try {
    // 이름 목록 분리
    const names = namesString.split(',').map(name => name.trim());

    // 제외 조합 분리 (예: "김민준-이서준,박서연-최윤서")
    let exclusions = [];
    if (exclusionsString) {
      exclusions = exclusionsString.split(',')
      .map(pair => pair.split('-').map(name => name.trim()))
      .filter(pair => pair.length === 2);
    }

    res.status(200).json({ names, exclusions });
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    res.status(500).json({
      error: '데이터를 처리하는 중 오류가 발생했습니다.'
    });
  }
}