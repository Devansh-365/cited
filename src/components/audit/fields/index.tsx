import dynamic from "next/dynamic"
import {
  ChevronDown,
  LayoutTemplate,
  Link,
  Presentation,
  Type,
} from "lucide-react"
import { z } from "zod"

const ShortTextInput = dynamic(() =>
  import("./short-text-input").then((mod) => mod.ShortTextInput)
)
const ShortTextCreateAnswer = dynamic(() =>
  import("./short-text-input").then((mod) => mod.ShortTextCreateAnswer)
)
const DropdownInput = dynamic(() =>
  import("./dropdown-input").then((mod) => mod.DropdownInput)
)
const WebsiteFieldInput = dynamic(() =>
  import("./website-field-input").then((mod) => mod.WebsiteFieldInput)
)

const WebsiteCreateAnswer = dynamic(() => import("./website-input"))

const WelcomeCreateAnswer = dynamic(() => import("./welcome-answer"))
const EndCreateAnswer = () => null

export const FIELDS = [
  // Text
  {
    type: "SHORT_TEXT",
    name: "Short Text",
    group: "TEXT",
    dataType: "string",
    icon: <Type />,
    createAnswer: ShortTextCreateAnswer,
    input: ShortTextInput,
  },

  {
    type: "WEBSITE",
    name: "Website",
    group: "CONTACT_INFO",
    dataType: "url",
    icon: <Link />,
    createAnswer: WebsiteCreateAnswer,
    input: WebsiteFieldInput,
  },
  {
    type: "DROPDOWN",
    name: "Dropdown",
    group: "CHOICE",
    dataType: "string",
    icon: <ChevronDown />,
    createAnswer: ShortTextCreateAnswer,
    input: DropdownInput,
  },

  // SCREENS
  {
    type: "WELCOME",
    name: "Welcome Screen",
    group: "SCREEN",
    dataType: "string",
    icon: <LayoutTemplate />,
    createAnswer: WelcomeCreateAnswer,
    input: ShortTextInput,
  },
  {
    type: "END",
    name: "End Screen",
    group: "SCREEN",
    dataType: "string",
    icon: <Presentation />,
    createAnswer: EndCreateAnswer,
    input: ShortTextInput,
  },
]

export const FIELD_TYPES = [
  "SHORT_TEXT",
  "WEBSITE",
  "DROPDOWN",
  "WELCOME",
  "END",
] as const
type fieldTypekey = (typeof FIELD_TYPES)[number]
export const TYPE_OF_FIELDS: z.ZodType<fieldTypekey> = z.enum(FIELD_TYPES)

