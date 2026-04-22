import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAdminSettings } from '../admin.selectors'
import { syncAdminSettings, updateSettings } from '../admin.store'
import {
  toSettingsFormState,
  validateSettingsForm,
  type SettingsErrors,
  type SettingsFormState,
} from '../admin.settings-form'

function useAdminSettingsPageController() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const settings = useAppSelector(selectAdminSettings)
  const [form, setForm] = useState<SettingsFormState>(toSettingsFormState(settings))
  const [errors, setErrors] = useState<SettingsErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const failSave = () => {
    dispatch(
      pushToast({
        title: 'Save failed',
        description: 'Settings were restored. Please try again.',
        variant: 'error',
      }),
    )
  }

  const handleSave = async () => {
    if (isSaving) {
      return
    }

    const validation = validateSettingsForm(form)
    setErrors(validation.errors)
    if (!validation.payload) {
      dispatch(
        pushToast({
          title: 'Fix validation errors',
          description: 'Check the settings form.',
          variant: 'error',
        }),
      )
      return
    }

    setIsSaving(true)
    const previousSettings = settings
    const nextSettings = validation.payload

    dispatch(updateSettings(nextSettings))

    try {
      await dispatch(syncAdminSettings(nextSettings)).unwrap()
      dispatch(
        pushToast({
          title: 'Settings saved',
          description: 'Store settings have been updated.',
          variant: 'success',
        }),
      )
    } catch {
      dispatch(updateSettings(previousSettings))
      failSave()
    } finally {
      setIsSaving(false)
    }
  }

  return {
    errors,
    form,
    isSaving,
    setForm,
    handleBackToAdministration: () => navigate('/admin/administration'),
    handleSaveAction: () => {
      void handleSave()
    },
  }
}

export default useAdminSettingsPageController
