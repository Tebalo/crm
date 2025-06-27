import FeedbackForm from '@/components/forms/feedback-form'

export default function FeedbackPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">General Feedback & Complaints</h1>
      <FeedbackForm />
    </main>
  )
}
