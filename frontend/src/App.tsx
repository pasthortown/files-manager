import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageWrapper } from './components/layout';
import { Dashboard } from './features/home';
import { ArchivosList } from './features/files';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageWrapper />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/archivos" element={<ArchivosList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
