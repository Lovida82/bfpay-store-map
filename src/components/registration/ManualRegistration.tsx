import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Dropdown } from '@/components/common';
import { createStore } from '@/services/api/stores';
import { useStoreStore } from '@/stores';
import { STORE_CATEGORIES, type StoreCategory, type StoreCreateInput } from '@/types/store';
import toast from 'react-hot-toast';

export function ManualRegistration() {
  const navigate = useNavigate();
  const { addStore } = useStoreStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<StoreCreateInput>>({
    name: '',
    address: '',
    addressDetail: '',
    phone: '',
    category: '음식점',
    businessNumber: '',
  });

  const handleChange = (field: keyof StoreCreateInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = '가게명을 입력해주세요';
    }

    if (!formData.address?.trim()) {
      newErrors.address = '주소를 입력해주세요';
    }

    if (!formData.category) {
      newErrors.category = '업종을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const store = await createStore({
        ...formData,
        sourceType: 'manual',
      } as StoreCreateInput);

      addStore(store);
      toast.success('가맹점이 등록되었습니다');
      navigate(`/store/${store.id}`);
    } catch (error: any) {
      console.error('Failed to create store:', error);
      toast.error(error.message || '가맹점 등록에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="가게명"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="가게 이름을 입력하세요"
          error={errors.name}
        />
      </div>

      <div>
        <Input
          label="주소"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="도로명 주소를 입력하세요"
          error={errors.address}
          helperText="입력한 주소로 자동으로 위치가 검색됩니다"
        />
      </div>

      <div>
        <Input
          label="상세 주소"
          value={formData.addressDetail}
          onChange={(e) => handleChange('addressDetail', e.target.value)}
          placeholder="상세 주소 (예: 2층, 101호)"
        />
      </div>

      <div>
        <Dropdown
          label="업종"
          options={STORE_CATEGORIES}
          value={formData.category as StoreCategory}
          onChange={(value) => handleChange('category', value)}
        />
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div>
        <Input
          label="전화번호"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="02-1234-5678"
          type="tel"
        />
      </div>

      <div>
        <Input
          label="사업자등록번호"
          value={formData.businessNumber}
          onChange={(e) => handleChange('businessNumber', e.target.value)}
          placeholder="000-00-00000"
        />
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        가맹점 등록
      </Button>
    </form>
  );
}
