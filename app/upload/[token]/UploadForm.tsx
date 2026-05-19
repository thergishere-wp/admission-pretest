'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, Upload, FileText, X } from 'lucide-react'

interface Props {
  token: string
  studentName: string
  sessionTitle: string
}

export default function UploadForm({ token, studentName, sessionTitle }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.')
      return
    }
    setError('')
    setFile(f)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('token', token)
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const json = await res.json()
    setUploading(false)

    if (!res.ok) {
      setError(json.error || 'Upload failed. Please try again.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Upload Successful!</h2>
        <p className="text-slate-600 max-w-sm mx-auto">
          Your result file has been submitted. The admissions team will review it and get back to you.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Upload Your Result</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Hello <strong>{studentName}</strong> — please upload your exam result file for <strong>{sessionTitle}</strong>.
        </p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Result File</CardTitle>
          <CardDescription>PDF only &bull; Maximum 10MB</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-5">
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200"
              onClick={() => inputRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-primary shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-slate-900 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-2 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">Click to select your PDF file</p>
                  <p className="text-xs text-slate-400 mt-1">or drag and drop here</p>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading…' : 'Submit Result File'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Important</p>
        <ul className="space-y-1 list-disc list-inside text-amber-700">
          <li>Only the file downloaded directly from the exam platform is accepted</li>
          <li>Do not modify or rename the file before uploading</li>
          <li>You can only upload once — double check before submitting</li>
        </ul>
      </div>
    </div>
  )
}
