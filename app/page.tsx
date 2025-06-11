import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardMap } from "@/components/dashboard-map"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white p-4">
        <h1 className="text-xl font-medium">서울 팝업 상점 대시보드</h1>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4 flex gap-2">
              <Button variant="outline" size="sm" className="text-xs rounded-full bg-gray-100 hover:bg-gray-200">
                인기 지역
              </Button>
              <Button variant="outline" size="sm" className="text-xs rounded-full bg-gray-100 hover:bg-gray-200">
                타겟 인터뷰
              </Button>
              <Button variant="outline" size="sm" className="text-xs rounded-full bg-gray-100 hover:bg-gray-200">
                모집
              </Button>
            </div>

            <DashboardMap />
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-gray-100">
              <h3 className="text-center text-gray-500 mb-4">시간대별 소비자 그래프</h3>
              <div className="h-32"></div>
            </Card>

            <Card className="p-6 bg-gray-100">
              <h3 className="text-center text-gray-500 mb-4">방문객수 시간 추이</h3>
              <div className="h-32"></div>
            </Card>

            <Card className="p-6 bg-green-50">
              <h3 className="text-center text-gray-700 mb-4">간편 카드뷰 워드클라우드</h3>
              <div className="h-32"></div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
