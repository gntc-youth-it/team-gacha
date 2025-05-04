import React, { useState } from 'react';

function App() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNames = async () => {
    try {
      setIsLoading(true);
      setError('');

      let names;

      // 현재 환경 확인 (로컬인지 프로덕션인지)
      const isDevelopment = window.location.hostname === 'localhost'
          || window.location.hostname === '127.0.0.1';

      if (isDevelopment) {
        // 로컬 환경: 임시 데이터 사용
        names = [
          '김민준', '이서준', '박서연', '최윤서', '정지호',
          '장도윤', '오유준', '정지윤', '김하린', '이준우',
          '홍승아', '김사랑', '이유진', '박민서', '최지우'
        ];
        console.log('🚀 로컬 환경 - 임시 데이터 사용');
      } else {
        // 프로덕션 환경: API 호출
        console.log('🌐 프로덕션 환경 - API 호출');
        const response = await fetch('/api/getNames');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '이름 목록을 가져올 수 없습니다.');
        }

        const data = await response.json();
        names = data.names;
      }

      // 조 배치 로직 실행
      const assignedGroups = assignToGroups(names);
      setGroups(assignedGroups);

    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const assignToGroups = (names) => {
    const shuffledNames = [...names].sort(() => Math.random() - 0.5);
    const totalPeople = shuffledNames.length;
    const numberOfGroups = Math.ceil(totalPeople / 6);
    const groups = [];

    for (let i = 0; i < numberOfGroups; i++) {
      const groupSize = i === numberOfGroups - 1
          ? totalPeople - (i * 6)
          : Math.min(6, totalPeople - (i * 6));

      const group = shuffledNames.slice(i * 6, i * 6 + groupSize);
      groups.push({
        id: i + 1,
        members: group
      });
    }

    return groups;
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
                          {group.id}조
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

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>청년봉사선교회 IT부 ㅎ© 2025</p>
          </div>
        </div>
      </div>
  );
}

export default App;