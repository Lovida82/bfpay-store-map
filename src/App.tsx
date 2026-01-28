import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { StoreDetailPage } from './pages/StoreDetailPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { MyPage } from './pages/MyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="map" element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="store/:id" element={<StoreDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="register"
          element={
            <ProtectedRoute>
              <RegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
