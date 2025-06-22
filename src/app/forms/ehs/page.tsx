import CaseForm from '@/components/forms/case-form'

export default function EHSPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Environmental, Health & Safety (EHS)</h1>
      <CaseForm caseType="ehs" />
    </main>
  )
}

