import {Stack, Text, TextInput} from '@sanity/ui'

export const FontAwesomeSixIconInput = (props) => {
  const {elementProps} = props

  const link = `<a href="https://fontawesome.com/search?o=r&m=free&s=solid" target='_blank'>View available icons on FontAwesome</a>`

  return (
    <Stack space={2}>
      <TextInput {...elementProps} />
      <Text>
        <div dangerouslySetInnerHTML={{__html: link}}></div>
      </Text>
    </Stack>
  )
}
