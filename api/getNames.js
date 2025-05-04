export default function handler(req, res) {
  const namesString = process.env.YOUTH_NAMES;

  if (!namesString) {
    return res.status(500).json({
      error: '환경변수에서 이름 목록을 찾을 수 없습니다.'
    });
  }

  try {
    const names = namesString.split(',').map(name => name.trim());
    res.status(200).json({ names });
  } catch (error) {
    console.error('Error processing names:', error); // error 사용
    res.status(500).json({
      error: '이름 목록을 처리하는 중 오류가 발생했습니다.'
    });
  }
}