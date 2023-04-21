import {useCallback} from 'react'
import {Stack, Text, TextInput} from '@sanity/ui'
import {set, unset} from 'sanity'

export const ClientIdInput = (props) => {
  const {elementProps, onChange, value = ''} = props

  const handleChange = useCallback((event) => {
    const nextValue = event.currentTarget.value
    onChange(nextValue ? set(nextValue) : unset())
  }, [onChange])

  let link = ''
  if (value.length > 0) {
    link = `Preview: <a href='http://localhost:8888/dashboard/${value}/' target='_blank'>Locally</a> &middot; <a href='https://thenumber.ninja/dashboard/${value}/' target='_blank'>Live</a>`
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
