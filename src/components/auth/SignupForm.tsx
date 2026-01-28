import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/common';
import { useAuthStore } from '@/stores';
import { isValidEmail, isValidPassword, isValidNickname } from '@/utils/validators';
import toast from 'react-hot-toast';

export function SignupForm() {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!isValidEmail(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (!isValidPassword(password)) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    if (!nickname) {
      newErrors.nickname = '닉네임을 입력해주세요';
    } else if (!isValidNickname(nickname)) {
      newErrors.nickname = '닉네임은 2~20자여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await signUp(email, password, nickname);
      toast.success('회원가입이 완료되었습니다');
      navigate('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || '회원가입에 실패했습니다');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          type="email"
          label="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          error={errors.email}
          autoComplete="email"
        />
      </div>

      <div>
        <Input
          type="text"
          label="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (2~20자)"
          error={errors.nickname}
          autoComplete="nickname"
        />
      </div>

      <div>
        <Input
          type="password"
          label="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 (6자 이상)"
          error={errors.password}
          autoComplete="new-password"
        />
      </div>

      <div>
        <Input
          type="password"
          label="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        회원가입
      </Button>

      <p className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          로그인
        </Link>
      </p>
    </form>
  );
}
