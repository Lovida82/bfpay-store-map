import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Dropdown, FileUpload } from '@/components/common';
import { createStore, checkDuplicateStore } from '@/services/api/stores';
import { useStoreStore } from '@/stores';
import { STORE_CATEGORIES, type StoreCategory, type StoreCreateInput } from '@/types/store';
import toast from 'react-hot-toast';

interface OCRStoreItem {
  name: string;
  address: string;
  category: string;
  selected: boolean;
  isDuplicate?: boolean;
  duplicateInfo?: string;
}

interface OCRResult {
  stores: OCRStoreItem[];
}

export function OCRRegistration() {
  const navigate = useNavigate();
  const { addStore } = useStoreStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storeList, setStoreList] = useState<OCRStoreItem[]>([]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    await analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type || 'image/jpeg';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `이 이미지에서 제로페이/비플페이 가맹점 정보를 추출해주세요.

여러 가맹점이 있다면 모두 추출해주세요.

반드시 다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "stores": [
    {
      "name": "가게명",
      "address": "주소",
      "category": "업종 (음식점/카페/편의점/마트/약국/병원/미용/숙박/기타 중 하나)"
    }
  ]
}

이미지에서 가맹점 정보를 찾을 수 없으면 {"stores": []}를 반환하세요.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error('OCR 분석에 실패했습니다');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{"stores": []}';

      // JSON 파싱 시도
      let result: OCRResult;
      try {
        // 코드 블록 제거
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        result = JSON.parse(cleanContent);
      } catch {
        console.error('Failed to parse OCR result:', content);
        result = { stores: [] };
      }

      const storesWithSelection = result.stores.map((store) => ({
        ...store,
        selected: true,
      }));

      setStoreList(storesWithSelection);

      if (storesWithSelection.length > 0) {
        toast.success(`${storesWithSelection.length}개의 가맹점이 인식되었습니다`);
      } else {
        toast.error('가맹점 정보를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('OCR analysis failed:', error);
      toast.error('이미지 분석에 실패했습니다. 수동으로 입력해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const toggleStoreSelection = (index: number) => {
    setStoreList((prev) =>
      prev.map((store, i) => (i === index ? { ...store, selected: !store.selected } : store))
    );
  };

  const updateStoreField = (index: number, field: keyof OCRStoreItem, value: string) => {
    setStoreList((prev) =>
      prev.map((store, i) => (i === index ? { ...store, [field]: value } : store))
    );
  };

  // 중복 확인
  const checkDuplicates = async () => {
    const updatedList = await Promise.all(
      storeList.map(async (store) => {
        const duplicate = await checkDuplicateStore(store.name, store.address);
        if (duplicate) {
          return {
            ...store,
            isDuplicate: true,
            duplicateInfo: `이미 등록됨: ${duplicate.name} (${duplicate.address})`,
          };
        }
        return { ...store, isDuplicate: false, duplicateInfo: undefined };
      })
    );
    setStoreList(updatedList);

    const duplicateCount = updatedList.filter((s) => s.isDuplicate).length;
    if (duplicateCount > 0) {
      toast.error(`${duplicateCount}개의 중복 매장이 발견되었습니다`);
    } else {
      toast.success('중복 매장이 없습니다');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedStores = storeList.filter((s) => s.selected);
    if (selectedStores.length === 0) {
      toast.error('등록할 가맹점을 선택해주세요');
      return;
    }

    // 중복 매장 확인
    const duplicateStores = selectedStores.filter((s) => s.isDuplicate);
    if (duplicateStores.length > 0) {
      const confirmMsg = `${duplicateStores.length}개의 중복 매장이 있습니다. 계속 등록하시겠습니까?`;
      if (!confirm(confirmMsg)) {
        return;
      }
    }

    setIsSubmitting(true);

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (const store of selectedStores) {
      // 중복인 경우 건너뛰기
      if (store.isDuplicate) {
        skipCount++;
        continue;
      }

      try {
        const created = await createStore({
          name: store.name,
          address: store.address,
          category: store.category as StoreCategory,
          sourceType: 'ocr',
        } as StoreCreateInput);

        addStore(created);
        successCount++;
      } catch (error) {
        console.error('Failed to create store:', store.name, error);
        failCount++;
      }
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      toast.success(`${successCount}개의 가맹점이 등록되었습니다`);
    }
    if (skipCount > 0) {
      toast(`${skipCount}개의 중복 매장은 건너뛰었습니다`);
    }
    if (failCount > 0) {
      toast.error(`${failCount}개의 가맹점 등록에 실패했습니다`);
    }

    if (successCount > 0) {
      navigate('/');
    }
  };

  const selectedCount = storeList.filter((s) => s.selected).length;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          영수증, 간판 또는 가맹점 목록 스크린샷 업로드
        </label>
        <FileUpload onFileSelect={handleFileSelect} disabled={isAnalyzing} />

        {previewUrl && (
          <div className="mt-4">
            <img src={previewUrl} alt="업로드된 이미지" className="max-w-full max-h-64 h-auto rounded-lg shadow-sm" />
          </div>
        )}

        {isAnalyzing && (
          <div className="mt-4 flex items-center gap-2 text-primary-600">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>AI가 이미지를 분석 중...</span>
          </div>
        )}
      </div>

      {storeList.length > 0 && !isAnalyzing && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-600">
              {storeList.length}개의 가맹점이 인식되었습니다.
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={checkDuplicates}>
                중복 확인
              </Button>
              <span className="text-sm font-medium text-primary-600">{selectedCount}개 선택됨</span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {storeList.map((store, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  store.isDuplicate
                    ? 'border-red-400 bg-red-50'
                    : store.selected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                {store.isDuplicate && (
                  <div className="mb-2 text-sm text-red-600 font-medium">
                    ⚠️ {store.duplicateInfo}
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={store.selected}
                    onChange={() => toggleStoreSelection(index)}
                    className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1 space-y-2">
                    <Input
                      label="가게명"
                      value={store.name}
                      onChange={(e) => updateStoreField(index, 'name', e.target.value)}
                      placeholder="가게 이름"
                    />
                    <Input
                      label="주소"
                      value={store.address}
                      onChange={(e) => updateStoreField(index, 'address', e.target.value)}
                      placeholder="도로명 주소"
                    />
                    <Dropdown
                      label="업종"
                      options={STORE_CATEGORIES}
                      value={store.category as StoreCategory}
                      onChange={(value) => updateStoreField(index, 'category', value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={selectedCount === 0}>
            {selectedCount}개 가맹점 일괄 등록
          </Button>
        </form>
      )}

      {selectedFile && storeList.length === 0 && !isAnalyzing && (
        <div className="text-center py-8 text-gray-500">
          <p>이미지에서 가맹점 정보를 찾을 수 없습니다.</p>
          <p className="text-sm mt-2">수동 등록을 이용해주세요.</p>
        </div>
      )}
    </div>
  );
}
