import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import FormInput from "../components/FormInput"
import FormFileInput from "../components/FormFileInput"


const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    FileInput: FormFileInput,
  },
  formComponents: {},
  fieldContext,
  formContext,
})

export { useAppForm, useFieldContext, useFormContext }
