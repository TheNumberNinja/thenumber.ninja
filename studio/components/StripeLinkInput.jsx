import {Stack, Text, TextInput} from '@sanity/ui'

export const StripeLinkInput = (props) => {
  const {elementProps, schemaType, value = ''} = props
  const {baseUrl, objectType} = schemaType.options

  let link = ''
  if (value && value.length > 4) {
    link = `<a href="${baseUrl}${value}" target='_blank'>View ${objectType} in Stripe</a>`
  }

  return (
    <Stack space={2}>
      <TextInput {...elementProps} />
      <Text>
        <div dangerouslySetInnerHTML={{__html: link}}></div>
      </Text>
    </Stack>
  )
}
