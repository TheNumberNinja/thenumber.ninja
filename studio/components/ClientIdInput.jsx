import {useEffect, useState} from 'react'
import {SyncIcon} from '@sanity/icons/Sync'
import {Box, Button, Flex, Stack, Text, TextInput} from '@sanity/ui'
import {Tooltip} from '@sanity/ui/tooltip'
import {set, useFormValue} from 'sanity'

export async function clientIdForName(clientName) {
  // Taken from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
  const msgUint8 = new TextEncoder().encode(clientName) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
}

export const ClientIdInput = (props) => {
  const {elementProps, onChange, readOnly, value = ''} = props
  const clientName = useFormValue(['name'])
  const [expectedId, setExpectedId] = useState()

  useEffect(() => {
    let cancelled = false
    setExpectedId(undefined)
    if (clientName) {
      clientIdForName(clientName).then((hash) => {
        if (!cancelled) setExpectedId(hash)
      })
    }
    return () => {
      cancelled = true
    }
  }, [clientName])

  const matches = expectedId === value
  let tooltip = 'Set the Client ID from the name'
  if (!clientName) {
    tooltip = 'Enter a name to set the Client ID'
  } else if (matches) {
    tooltip = 'The Client ID matches the name'
  }

  let link = ''
  if (value.length > 0) {
    link = `Preview: <a href='http://localhost:8888/dashboard/${value}/' target='_blank'>Locally</a> &middot; <a href='https://thenumber.ninja/dashboard/${value}/' target='_blank'>Live</a>`
  }

  return (
    <Stack space={2}>
      <Flex gap={2}>
        <Box flex={1}>
          <TextInput {...elementProps} />
        </Box>
        <Tooltip
          content={
            <Box padding={2}>
              <Text size={1}>{tooltip}</Text>
            </Box>
          }
          placement="top"
          portal
        >
          {/* Wrapper keeps the tooltip working while the button is disabled */}
          <Box>
            <Button
              mode="ghost"
              icon={SyncIcon}
              aria-label="Set the Client ID from the name"
              disabled={readOnly || !expectedId || matches}
              onClick={() => onChange(set(expectedId))}
            />
          </Box>
        </Tooltip>
      </Flex>
      <Text>
        <div dangerouslySetInnerHTML={{__html: link}}></div>
      </Text>
    </Stack>
  )
}
