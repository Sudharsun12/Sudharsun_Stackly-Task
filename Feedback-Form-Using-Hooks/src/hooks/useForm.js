import { useState } from 'react'

/**
 * useForm — A generic custom hook for managing form state and validation.
 *
 * WHY "use" prefix?
 * React's eslint-plugin-react-hooks enforces the "use" prefix so the linter
 * can statically verify that this function follows the Rules of Hooks:
 * only called at the top level of a component/hook, never inside loops or
 * conditionals. Without the prefix, React cannot distinguish it from a
 * regular utility function and cannot protect you from misuse.
 *
 * @param {Object}   initialValues  - Shape of the form e.g. { name: '', email: '' }
 * @param {Function} validate       - Caller-supplied function that receives current
 *                                    values and returns an errors object.
 *                                    Empty object = form is valid.
 */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  /**
   * handleChange — reads e.target.name as a dynamic key so this one
   * function works for ANY field without knowing the field names ahead
   * of time.
   */
  function handleChange(e) {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  /**
   * validateForm — runs the caller-supplied validate() and stores the
   * result. Returns true when there are no error keys.
   */
  function validateForm() {
    const newErrors = validate(values)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * resetForm — restores values and errors back to their initial state.
   */
  function resetForm() {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, handleChange, validateForm, resetForm }
}
