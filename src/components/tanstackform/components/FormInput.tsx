import { Input } from "#/components/shadcn/ui/input"
import { useFieldContext } from "../hooks/hooks"
import type { FormControlProps } from "./FormBase"
import FormBase from "./FormBase"

const FormInput = (props: FormControlProps) => {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <Input
        id={field.name}
        name={field.name}
        type={props.type || "text"}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="Name"
        autoComplete="off"
      />
    </FormBase>
  )
}

export default FormInput
