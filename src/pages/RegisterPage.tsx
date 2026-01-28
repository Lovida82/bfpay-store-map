import { useState } from 'react';
import { ManualRegistration, OCRRegistration, ExcelRegistration } from '@/components/registration';
import { clsx } from 'clsx';

type TabType = 'manual' | 'ocr' | 'excel';

const TABS: { id: TabType; label: string; description: string }[] = [
  { id: 'manual', label: '수동 등록', description: '가게 정보를 직접 입력' },
  { id: 'ocr', label: '사진 등록', description: '영수증/간판 사진으로 자동 인식' },
  { id: 'excel', label: '일괄 등록', description: 'Excel 파일로 여러 가게 등록' },
];

export function RegisterPage() {
  const [activeTab, setActiveTab] = useState<TabType>('manual');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">가맹점 등록</h1>
        <p className="text-gray-600">비플페이 사용 가능한 가맹점을 등록해주세요.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 py-4 px-4 text-center border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <div>{tab.label}</div>
                <div className="text-xs font-normal text-gray-400 mt-0.5">{tab.description}</div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'manual' && <ManualRegistration />}
          {activeTab === 'ocr' && <OCRRegistration />}
          {activeTab === 'excel' && <ExcelRegistration />}
        </div>
      </div>
    </div>
  );
}
