import {Stack, Text, TextInput} from '@sanity/ui'

export const ClientIdInput = (props) => {
  const {elementProps, value = ''} = props

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
