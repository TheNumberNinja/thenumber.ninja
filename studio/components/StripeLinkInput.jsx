import {useCallback} from 'react'
import {Stack, Text, TextInput} from '@sanity/ui'
import {set, unset} from 'sanity'

export const StripeLinkInput = (props) => {
  const {elementProps, onChange, schemaType, value = ''} = props
  const {baseUrl, objectType} = schemaType.options

  const handleChange = useCallback((event) => {
    const nextValue = event.currentTarget.value
    onChange(nextValue ? set(nextValue) : unset())
  }, [onChange])

  let link = ''
  if (value.length > 4) {
    link = `<a href="${baseUrl}${value}" target='_blank'>View ${objectType} in Stripe</a>`
  }

  return (
    <Stack space={2}>
      <TextInput {...elementProps} />
      <Text><div dangerouslySetInnerHTML={{__html: link}}></div></Text>
    </Stack>
  )
}
