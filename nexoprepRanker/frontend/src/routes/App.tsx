import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ProcessingPage } from '../pages/ProcessingPage'
import { ResultsPage } from '../pages/ResultsPage'
import { UploadPage } from '../pages/UploadPage'
export function App() { return <Routes><Route element={<DashboardLayout/>}><Route index element={<UploadPage/>}/><Route path="processing/:id" element={<ProcessingPage/>}/><Route path="results/:id" element={<ResultsPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes> }
