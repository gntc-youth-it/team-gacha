import React, { useState } from 'react';

function App() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [exclusions, setExclusions] = useState([]);
  const [debug, setDebug] = useState('');

  const fetchNames = async () => {
    try {
      setIsLoading(true);
      setError('');
      setDebug('');

      let names, exclusionPairs;

      const isDevelopment = window.location.hostname === 'localhost'
          || window.location.hostname === '127.0.0.1';

      if (isDevelopment) {
        // 로컬 개발용 데이터
        names = [
          '김민준', '이서준', '박서연', '최윤서', '정지호',
          '장도윤', '오유준', '정지윤', '김하린', '이준우',
          '홍승아', '김사랑', '이유진', '박민서', '최지우'
        ];
        // 로컬 테스트용 제외 조합
        exclusionPairs = [
          ['김민준', '이서준'],
          ['박서연', '최윤서']
        ];
        console.log('🚀 로컬 환경 - 임시 데이터 사용');
        setDebug(`로컬 데이터: ${names.length}명, 제외조합: ${exclusionPairs.length}개`);
      } else {
        console.log('🌐 프로덕션 환경 - API 호출');
        const response = await fetch('/api/getNames');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '데이터를 가져올 수 없습니다.');
        }

        const data = await response.json();
        names = data.names;
        exclusionPairs = data.exclusions || [];
      }

      setExclusions(exclusionPairs);
      const assignedGroups = assignToGroups(names, exclusionPairs);
      setGroups(assignedGroups);

    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const assignToGroups = (names, exclusionPairs) => {
    const totalPeople = names.length;

    if (totalPeople <= 4) {
      return [{
        id: 1,
        members: names
      }];
    }

    // 조 수 계산
    let numberOfGroups = Math.round(totalPeople / 5.5);
    let avgPerGroup = totalPeople / numberOfGroups;

    while (avgPerGroup < 5 && numberOfGroups > 1) {
      numberOfGroups--;
      avgPerGroup = totalPeople / numberOfGroups;
    }

    while (avgPerGroup > 6 && totalPeople - numberOfGroups * 6 >= 5) {
      numberOfGroups++;
      avgPerGroup = totalPeople / numberOfGroups;
    }

    setDebug(prev => prev + `\n조 수: ${numberOfGroups}, 평균 인원: ${avgPerGroup.toFixed(1)}`);

    // 조 배치 시도
    let groups = [];
    let maxAttempts = 50;
    let attempts = 0;
    let validAssignment = false;

    while (!validAssignment && attempts < maxAttempts) {
      groups = [];
      const shuffledNames = [...names].sort(() => Math.random() - 0.5);

      // 조 초기화
      const baseSize = Math.floor(totalPeople / numberOfGroups);
      const remainder = totalPeople % numberOfGroups;

      let currentIndex = 0;
      for (let i = 0; i < numberOfGroups; i++) {
        const groupSize = i < remainder ? baseSize + 1 : baseSize;
        groups.push({
          id: i + 1,
          members: shuffledNames.slice(currentIndex, currentIndex + groupSize)
        });
        currentIndex += groupSize;
      }

      // 제약 조건 검사
      validAssignment = checkConstraints(groups, exclusionPairs);

      if (!validAssignment) {
        attempts++;
      }
    }

    setDebug(prev => prev + `\n배치 시도 횟수: ${attempts}`);

    if (!validAssignment) {
      setDebug(prev => prev + '\n❌ 제약 조건을 만족하는 배치를 찾을 수 없음');
      throw new Error('제약 조건을 만족하는 조 편성을 찾을 수 없습니다. 다시 시도해주세요.');
    }

    return groups;
  };

  const checkConstraints = (groups, exclusionPairs) => {
    for (const group of groups) {
      for (const [name1, name2] of exclusionPairs) {
        if (group.members.includes(name1) && group.members.includes(name2)) {
          return false;
        }
      }
    }
    return true;
  };

  const isDev = window.location.hostname === 'localhost'
      || window.location.hostname === '127.0.0.1';

  return (
      <div className="min-h-screen bg-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">
              청년봉사선교회 일일 임원 수련회
            </h1>
            <h2 className="text-xl text-center text-blue-700 mb-8">
              조 배치 시스템
            </h2>

            {isDev && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                  <strong>개발 모드:</strong> 임시 데이터를 사용합니다.
                </div>
            )}

            {/* 로컬 환경에서만 배제 조합 표시 */}
            {isDev && exclusions.length > 0 && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                  <strong>배제 조합:</strong> {exclusions.map((pair, idx) =>
                    `${pair[0]} ↔ ${pair[1]}`
                ).join(', ')}
                </div>
            )}

            {/* 로컬 환경에서만 디버그 정보 표시 */}
            {isDev && debug && (
                <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded mb-6 whitespace-pre-wrap font-mono text-sm">
                  {debug}
                </div>
            )}

            <div className="text-center mb-8">
              <button
                  onClick={fetchNames}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-md text-white font-medium
                ${isLoading
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isLoading ? '로딩 중...' : '조 배치하기'}
              </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
            )}

            {groups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group) => (
                      <div key={group.id} className="bg-blue-100 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-blue-800 mb-3">
                          {group.id}조 ({group.members.length}명)
                        </h3>
                        <ul className="space-y-2">
                          {group.members.map((member, index) => (
                              <li
                                  key={index}
                                  className="text-blue-700 bg-white px-3 py-1 rounded shadow-sm"
                              >
                                {member}
                              </li>
                          ))}
                        </ul>
                      </div>
                  ))}
                </div>
            )}
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">햣
            <p>청년봉사선교회 IT부 © 2025</p>
          </div>
        </div>
      </div>
  );
}

export default App;