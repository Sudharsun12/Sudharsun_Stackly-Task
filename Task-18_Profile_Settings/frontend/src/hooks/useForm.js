import { useState } from 'react'

/**
 * useForm — A generic custom hook for managing form state and validation.
 *
 * Adapted from Task 13 pattern for Task 18 Profile & Settings forms.
 *
 * @param {Object}   initialValues  - Shape of the form e.g. { name: '', email: '' }
 * @param {Function} validate       - Function that receives current values and returns
 *                                    an errors object. Empty object = form is valid.
 */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  // handleChange — reads e.target.name as dynamic key so one function
  // works for any field without knowing field names ahead of time
  function handleChange(e) {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // setField — programmatically update a single field (e.g. pre-filling from user data)
  function setField(name, value) {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  // validateForm — runs caller-supplied validate() and stores the result.
  // Returns true when there are no error keys.
  function validateForm() {
    const newErrors = validate ? validate(values) : {}
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // resetForm — restores values and errors back to initial state
  function resetForm() {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, handleChange, setField, validateForm, resetForm, setValues }
}
