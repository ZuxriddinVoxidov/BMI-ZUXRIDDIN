import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-8">
      <div className="text-8xl font-black text-indigo-200">404</div>
      <h2 className="text-2xl font-bold text-gray-800">Sahifa topilmadi</h2>
      <p className="text-gray-500">Siz qidirgan sahifa mavjud emas.</p>
      <Link href="/">
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          🏠 Bosh sahifaga qaytish
        </Button>
      </Link>
    </div>
  )
}
