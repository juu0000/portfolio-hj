import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BuildViewDetail from './components/build/BuildViewDetail';
import DeployViewDetail from './components/deploy/DeployViewDetail';
import MainPage from './components/home/MainPage';
import BuildView from './components/build/BuildView';
import DeployView from './components/deploy/DeployView';

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />}> 
                    <Route path="build" element={<BuildView />}></Route>
                    <Route path="deploy" element={<DeployView />}></Route>
                    <Route path="build/:jobId" element={<BuildViewDetail />} />
                    <Route path="deploy/:appName" element={<DeployViewDetail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
