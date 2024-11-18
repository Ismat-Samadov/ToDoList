import AddTask from '../src/components/AddTask'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Tasks</h1>
        <AddTask />
      </div>
    </main>
  )
}