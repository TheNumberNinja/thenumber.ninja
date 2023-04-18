import {useCallback} from 'react'
import {Stack, Text, TextInput} from '@sanity/ui'
import {set, unset} from 'sanity'

export const FontAwesomeSixIconInput = (props) => {
  const {elementProps, onChange = ''} = props

  const handleChange = useCallback((event) => {
    const nextValue = event.currentTarget.value
    onChange(nextValue ? set(nextValue) : unset())
  }, [onChange])

  const link = `<a href="https://fontawesome.com/search?o=r&m=free&s=solid" target='_blank'>View available icons on FontAwesome</a>`

  return (
    <Stack space={2}>
      <TextInput {...elementProps} />
      <Text><div dangerouslySetInnerHTML={{__html: link}}></div></Text>
    </Stack>
  )
}
