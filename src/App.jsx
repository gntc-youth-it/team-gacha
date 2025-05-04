import React, { useState } from 'react';

const App = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 사용자 이름 목록을 가져오는 함수
  const fetchNames = async () => {
    try {
      setIsLoading(true);
      setError('');

      // API 호출
      const response = await fetch('/api/getNames');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이름 목록을 가져올 수 없습니다.');
      }

      const names = data.names;

      // 조 배치 로직 실행
      const assignedGroups = assignToGroups(names);
      setGroups(assignedGroups);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 조 배치 로직
  const assignToGroups = (names) => {
    // 이름 배열 복사 및 무작위 섞기
    const shuffledNames = [...names].sort(() => Math.random() - 0.5);

    // 조 크기 계산 (5-6명)
    const totalPeople = shuffledNames.length;
    const numberOfGroups = Math.ceil(totalPeople / 6);
    const groups = [];

    // 조 배치
    for (let i = 0; i < numberOfGroups; i++) {
      const groupSize = i === numberOfGroups - 1
          ? totalPeople - (i * 6) // 마지막 조는 남은 인원
          : Math.min(6, totalPeople - (i * 6)); // 다른 조는 최대 6명

      const group = shuffledNames.slice(i * 6, i * 6 + groupSize);
      groups.push({
        id: i + 1,
        members: group
      });
    }

    return groups;
  };

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
            <p>청년봉사선교회 © 2025</p>
          </div>
        </div>
      </div>
  );
};

export default App;