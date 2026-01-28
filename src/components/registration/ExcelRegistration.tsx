import { useState } from 'react';
import { Button, FileUpload } from '@/components/common';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface ExcelRow {
  name: string;
  address: string;
  phone?: string;
  category?: string;
}

export function ExcelRegistration() {
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ExcelRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setErrors([]);

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

    setIsUploading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ stores: parsedData }),
      });

      if (!response.ok) {
        throw new Error('일괄 등록에 실패했습니다');
      }

      const result = await response.json();
      toast.success(`${result.success}개의 가맹점이 등록되었습니다`);

      if (result.failed > 0) {
        toast.error(`${result.failed}개의 가맹점 등록에 실패했습니다`);
      }

      setParsedData([]);
    } catch (error: any) {
      console.error('Bulk upload failed:', error);
      toast.error(error.message || '일괄 등록에 실패했습니다');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Excel 파일 형식 안내</h4>
        <p className="text-sm text-blue-700 mb-2">첫 번째 행에 다음 컬럼명을 사용해주세요:</p>
        <ul className="text-sm text-blue-700 list-disc list-inside">
          <li>가게명 (필수)</li>
          <li>주소 (필수)</li>
          <li>전화번호 (선택)</li>
          <li>업종 (선택)</li>
        </ul>
      </div>

      <FileUpload
        onFileSelect={handleFileSelect}
        accept={{
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/vnd.ms-excel': ['.xls'],
          'text/csv': ['.csv'],
        }}
        disabled={isUploading}
      />

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

      {parsedData.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">미리보기 ({parsedData.length}개)</h4>

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

          <Button onClick={handleUpload} className="w-full" isLoading={isUploading} disabled={errors.length > 0}>
            {parsedData.length}개 가맹점 일괄 등록
          </Button>
        </div>
      )}
    </div>
  );
}
