import Button from './Button'
import Select from './Select'

type FileFormatOption<TFormat extends string> = {
  value: TFormat
  label: string
}

type FileFormatActionProps<TFormat extends string> = {
  actionLabel: string
  disabled?: boolean
  format: TFormat
  options: Array<FileFormatOption<TFormat>>
  selectLabel?: string
  onAction: () => void
  onFormatChange: (format: TFormat) => void
}

function FileFormatAction<TFormat extends string>({
  actionLabel,
  disabled = false,
  format,
  options,
  selectLabel = 'File type',
  onAction,
  onFormatChange,
}: FileFormatActionProps<TFormat>) {
  return (
    <div className="file-format-action">
      <Select
        label={selectLabel}
        value={format}
        options={options}
        onChange={(event) => onFormatChange(event.target.value as TFormat)}
      />
      <Button variant="outline" onClick={onAction} disabled={disabled}>
        {actionLabel}
      </Button>
    </div>
  )
}

export default FileFormatAction
