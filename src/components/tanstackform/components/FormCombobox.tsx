import { useFieldContext } from "../hooks/hooks"
import FormBase from "./FormBase"
import type { FormControlProps } from "./FormBase"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "#/components/shadcn/ui/combobox"

export interface ComboboxOption {
  value: string
  label: string
  icon?: string
}

interface FormComboboxProps extends FormControlProps {
  options: ComboboxOption[]
  placeholder?: string
}

const FormCombobox = ({ options, placeholder = "Search...", ...props }: FormComboboxProps) => {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const selectedOption = options.find((opt) => opt.value === field.state.value) ?? null

  return (
    <FormBase {...props}>
      <Combobox
        items={options}
        itemToStringValue={(opt: ComboboxOption) => opt.label}
        value={selectedOption}
        onValueChange={(opt: ComboboxOption | null) => {
          field.handleChange(opt?.value ?? "")
        }}
      >
        <ComboboxInput
          showClear
          placeholder={placeholder}
          aria-invalid={isInvalid}
          onBlur={field.handleBlur}
        />
        <ComboboxContent>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxList>
            {(opt: ComboboxOption) => (
              <ComboboxItem key={opt.value} value={opt}>
                {opt.icon && (
                  <img src={opt.icon} alt={opt.label} className="size-5 rounded-sm object-cover" />
                )}
                {opt.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FormBase>
  )
}

export default FormCombobox
