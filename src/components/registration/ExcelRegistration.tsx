import { useState } from 'react';
import { Button, FileUpload } from '@/components/common';
import { createStore } from '@/services/api/stores';
import { geocodeAddress } from '@/services/kakaoMap';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import type { StoreCategory } from '@/types/store';

interface ExcelRow {
  name: string;
  address: string;
  phone?: string;
  category?: string;
}

interface ProcessedRow extends ExcelRow {
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export function ExcelRegistration() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ExcelRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // 샘플 템플릿 다운로드
  const downloadTemplate = () => {
    const sampleData = [
      { 가게명: '홍콩반점', 주소: '서울 강남구 테헤란로 123', 전화번호: '02-1234-5678', 업종: '음식점' },
      { 가게명: '스타벅스 강남점', 주소: '서울 강남구 강남대로 456', 전화번호: '02-2345-6789', 업종: '카페' },
      { 가게명: 'GS25 역삼점', 주소: '서울 강남구 역삼로 789', 전화번호: '', 업종: '편의점' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '가맹점목록');

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 20 }, // 가게명
      { wch: 40 }, // 주소
      { wch: 15 }, // 전화번호
      { wch: 12 }, // 업종
    ];

    XLSX.writeFile(workbook, '가맹점_등록_템플릿.xlsx');
    toast.success('템플릿 파일이 다운로드되었습니다');
  };

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setErrors([]);
    setProcessedData([]);

    try {
      const data = await parseExcel(file);
      const validationErrors: string[] = [];

      data.forEach((row, index) => {
        if (!row.name) {
          validationErrors.push(`${index + 2}행: 가게명이 없습니다`);
        }
        if (!row.address) {
          validationErrors.push(`${index + 2}행: 주소가 없습니다`);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      }

      setParsedData(data);
      toast.success(`${data.length}개의 가맹점 정보를 불러왔습니다`);
    } catch (error) {
      console.error('Excel parsing failed:', error);
      toast.error('Excel 파일 분석에 실패했습니다');
    } finally {
      setIsUploading(false);
    }
  };

  const parseExcel = (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

          const mappedData: ExcelRow[] = jsonData.map((row: any) => ({
            name: row['가게명'] || row['name'] || row['상호명'] || '',
            address: row['주소'] || row['address'] || '',
            phone: row['전화번호'] || row['phone'] || row['연락처'] || '',
            category: row['업종'] || row['category'] || '기타',
          }));

          resolve(mappedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      toast.error('업로드할 데이터가 없습니다');
      return;
    }

    if (errors.length > 0) {
      toast.error('오류가 있는 데이터는 업로드할 수 없습니다');
      return;
    }

    setIsProcessing(true);
    const results: ProcessedRow[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const processedRow: ProcessedRow = { ...row, status: 'pending' };

      try {
        // 주소 유효성 확인 (geocodeAddress는 주소를 찾지 못하면 에러를 던짐)
        await geocodeAddress(row.address);

        // 가맹점 등록 (createStore 내부에서 geocodeAddress 호출)
        await createStore({
          name: row.name,
          address: row.address,
          category: (row.category || '기타') as StoreCategory,
          phone: row.phone,
          sourceType: 'excel',
        });

        processedRow.status = 'success';
        processedRow.message = '등록 완료';
        successCount++;
      } catch (error: any) {
        processedRow.status = 'error';
        processedRow.message = error.message || '등록 실패';
        failCount++;
      }

      results.push(processedRow);
      setProcessedData([...results]);

      // API 부하 방지를 위한 딜레이
      if (i < parsedData.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      toast.success(`${successCount}개의 가맹점이 등록되었습니다`);
    }
    if (failCount > 0) {
      toast.error(`${failCount}개의 가맹점 등록에 실패했습니다`);
    }
  };

  const resetForm = () => {
    setParsedData([]);
    setProcessedData([]);
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* 안내 및 템플릿 다운로드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Excel 파일 형식 안내</h4>

        <div className="bg-white rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-600 mb-2">첫 번째 행에 아래 컬럼명을 사용해주세요:</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 text-gray-700">컬럼명</th>
                <th className="text-left py-1 text-gray-700">필수</th>
                <th className="text-left py-1 text-gray-700">예시</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b">
                <td className="py-1 font-medium">가게명</td>
                <td className="py-1"><span className="text-red-500">필수</span></td>
                <td className="py-1">홍콩반점</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 font-medium">주소</td>
                <td className="py-1"><span className="text-red-500">필수</span></td>
                <td className="py-1">서울 강남구 테헤란로 123</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 font-medium">전화번호</td>
                <td className="py-1"><span className="text-gray-400">선택</span></td>
                <td className="py-1">02-1234-5678</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">업종</td>
                <td className="py-1"><span className="text-gray-400">선택</span></td>
                <td className="py-1">음식점, 카페, 편의점 등</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Button variant="secondary" size="sm" onClick={downloadTemplate}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          샘플 템플릿 다운로드
        </Button>
      </div>

      {/* 파일 업로드 */}
      {processedData.length === 0 && (
        <FileUpload
          onFileSelect={handleFileSelect}
          accept={{
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
          }}
          disabled={isUploading || isProcessing}
        />
      )}

      {/* 오류 표시 */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">데이터 오류</h4>
          <ul className="text-sm text-red-700 list-disc list-inside max-h-32 overflow-y-auto">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 미리보기 (업로드 전) */}
      {parsedData.length > 0 && processedData.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">미리보기 ({parsedData.length}개)</h4>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              다시 선택
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">가게명</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">주소</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">전화번호</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">업종</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedData.slice(0, 10).map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.name || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.address || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.phone || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.category || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 10 && (
              <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                ...외 {parsedData.length - 10}개
              </div>
            )}
          </div>

          <Button onClick={handleUpload} className="w-full" isLoading={isProcessing} disabled={errors.length > 0}>
            {parsedData.length}개 가맹점 일괄 등록
          </Button>
        </div>
      )}

      {/* 처리 결과 */}
      {processedData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              처리 결과 ({processedData.filter((r) => r.status === 'success').length}/{processedData.length} 성공)
            </h4>
            {!isProcessing && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                새로 등록하기
              </Button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상태</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">가게명</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">주소</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">결과</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedData.map((row, index) => (
                  <tr key={index} className={row.status === 'error' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2">
                      {row.status === 'pending' && (
                        <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {row.status === 'success' && (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {row.status === 'error' && (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.address}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{row.message || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isProcessing && (
            <div className="text-center text-sm text-gray-500">
              처리 중... ({processedData.length}/{parsedData.length})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
