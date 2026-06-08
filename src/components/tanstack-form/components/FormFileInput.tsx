import { useFieldContext } from "../hooks/hooks"

import { X } from "lucide-react"

import { useRef } from "react"
import FormBase from "./FormBase"
import type {FormControlProps} from "./FormBase";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "#/components/shadcn/ui/input-group"

const FormFileInput = (props: FormControlProps) => {
  const field = useFieldContext<File | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          type={"file"}
          ref={inputRef}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(e) => {
            field.handleChange(e.target.files?.[0])
          }}
          aria-invalid={isInvalid}
          autoComplete="off"
        />
        {field.state.value && (
          <InputGroupAddon
            align="inline-end"
            onClick={() => {
              field.handleChange(undefined)
              if (inputRef.current) inputRef.current.value = ""
            }}
          >
            <InputGroupButton variant={"outline"}>
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </FormBase>
  )
}

export default FormFileInput
