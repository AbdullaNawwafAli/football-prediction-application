import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "#/components/shadcn/ui/field"
import type { ReactNode } from "react"
import { useFieldContext } from "../hooks/hooks"

export interface FormControlProps {
  label: string
  description?: string
  type?: string
}

export interface FormBaseProps extends FormControlProps {
  children: ReactNode
  horizontal?: boolean
  controlFirst?: boolean
}


const FormBase = ({
  label,
  description,
  children,
  controlFirst,
  horizontal,
}: FormBaseProps) => {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const labelElement = (
    <>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
    </>
  )

  const errorElement = isInvalid && (
    <FieldError errors={field.state.meta.errors} />
  )

  return (
    <Field
      data-invalid={isInvalid}
      orientation={horizontal ? "horizontal" : undefined}
    >
      {controlFirst ? (
        <>
          <>
            {children}
            <FieldContent>
              {labelElement} {errorElement}
            </FieldContent>
          </>
        </>
      ) : (
        <>
          <FieldContent>{labelElement}</FieldContent>
          {children}
          {errorElement}
        </>
      )}
    </Field>
  )
}

export default FormBase
