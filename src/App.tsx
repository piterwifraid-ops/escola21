import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import AnimatedRoutes from './components/AnimatedRoutes';
import TopProgressBar from './components/TopProgressBar';
import Login from './components/Login';
import { LocationProvider } from './context/LocationContext';
import { UserProvider } from './context/UserContext';


function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function App() {
  return (
    <UserProvider>
      <LocationProvider>
        <Router>
          <ScrollToTop />
          <TopProgressBar />
          <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
            <Routes>
              {/* Rota do Login - sem Header e Footer */}
              <Route path="/login" element={<Login />} />
              {/* Rotas principais - com Header e Footer */}
              <Route path="/*" element={
                <>
                  <Header />
                  <AnimatedRoutes />
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </LocationProvider>
    </UserProvider>
  );
}

export default App;