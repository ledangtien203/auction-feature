import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';
import { Toaster } from './components/ui/sonner';
import { AIChatbot } from './components/AIChatbot';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <AIChatbot />
    </>
  );
}
