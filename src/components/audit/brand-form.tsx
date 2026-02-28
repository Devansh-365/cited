"use client"

import React, { Suspense, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"

import { FIELDS } from "@/components/audit/fields"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export interface ResponseItem {
  questionId: string
  text: string
  formId: string
}

interface Question {
  id: string
  text: string
  type: string
  order: number
  formId: string
}

interface BrandFormProps {
  questionList: Question[]
  onSubmit: (responses: ResponseItem[]) => void
}

const swipeUpVariants = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "-100%", opacity: 0 },
}

const ControlButtons = ({
  selectedQuestion,
  questionListLength,
  setSelectedQuestion,
}: {
  selectedQuestion: number
  questionListLength: number
  setSelectedQuestion: React.Dispatch<React.SetStateAction<number>>
}) => (
  <div className="flex gap-[1px]">
    <Button
      className="h-11 w-11 bg-[#104eb3] hover:bg-[#104eb3]/80"
      disabled={selectedQuestion === 0}
      onClick={() => setSelectedQuestion(selectedQuestion - 1)}
    >
      <ChevronUp size={40} color="white" />
    </Button>
    <Button
      className="h-11 w-11 bg-[#104eb3] hover:bg-[#104eb3]/80"
      disabled={selectedQuestion === questionListLength - 1}
      onClick={() => setSelectedQuestion(selectedQuestion + 1)}
    >
      <ChevronDown size={30} color="white" />
    </Button>
  </div>
)

const QuestionContent = ({
  selectedQuestion,
  questionList,
  selectedField,
  isLast = false,
  onQuestionSubmit,
}: {
  selectedQuestion: number
  questionList: Question[]
  selectedField: any
  isLast?: boolean
  onQuestionSubmit: (value: string) => void
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={selectedQuestion}
      variants={swipeUpVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="flex w-full flex-col sm:px-[20%]"
    >
      <div className="flex p-4">
        <div className="mt-[6px] flex gap-2 text-[12px] md:text-2xl">
          <span className="mt-1">
            {questionList[selectedQuestion]?.order}
          </span>
          <span className="mt-2">
            <ArrowRight color="blue" />
          </span>
        </div>
        <div className="m-2 resize-none overflow-hidden border-none text-lg outline-none placeholder:italic focus:ring-0 focus-visible:outline-none focus-visible:ring-0 md:text-2xl">
          {questionList[selectedQuestion].text}
        </div>
      </div>
      <div className="w-full px-8">
        {selectedField && (
          <Suspense fallback={<Skeleton className="h-4 w-12" />}>
            <selectedField.input
              className="text-2xl"
              onSubmit={(value: string) => onQuestionSubmit(value)}
              isLast={isLast}
            />
          </Suspense>
        )}
      </div>
    </motion.div>
  </AnimatePresence>
)

function BrandForm({ questionList, onSubmit }: BrandFormProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(0)
  const [displayEndScreen, setDisplayEndScreen] = useState(false)
  const [responses, setResponses] = useState<ResponseItem[]>([])

  if (questionList.length === 0) {
    return (
      <div className="flex h-full items-center text-center">
        Add Content to Get started
      </div>
    )
  }

  const selectedField = FIELDS.find(
    (f) => f.type === questionList[selectedQuestion].type
  )

  const handleQuestionSubmit = (value: string) => {
    const current = questionList[selectedQuestion]

    // upsert response for current question
    const updated = [
      ...responses.filter((r) => r.questionId !== current.id),
      { questionId: current.id, text: value, formId: current.formId },
    ]
    setResponses(updated)

    if (selectedQuestion + 1 === questionList.length) {
      onSubmit(updated)
      setDisplayEndScreen(true)
    } else {
      setSelectedQuestion((q) => q + 1)
    }
  }

  if (displayEndScreen) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 text-center">
        <p className="italic">Thank you for submitting the form!</p>
        <Button
          className="h-11 bg-[#104eb3] hover:bg-[#104eb3]/80"
          onClick={() => {
            setSelectedQuestion(0)
            setResponses([])
            setDisplayEndScreen(false)
          }}
        >
          Submit another response
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen">
      <div className="absolute bottom-0 flex w-full justify-between rounded-md p-4">
        <ControlButtons
          selectedQuestion={selectedQuestion}
          questionListLength={questionList.length}
          setSelectedQuestion={setSelectedQuestion}
        />
      </div>
      <div className="flex h-full w-full grow items-center justify-center">
        <QuestionContent
          selectedQuestion={selectedQuestion}
          questionList={questionList}
          selectedField={selectedField}
          isLast={selectedQuestion === questionList.length - 1}
          onQuestionSubmit={handleQuestionSubmit}
        />
      </div>
    </div>
  )
}

export default BrandForm
