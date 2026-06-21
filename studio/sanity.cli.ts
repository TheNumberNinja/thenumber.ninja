import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID as string,
    dataset: process.env.SANITY_STUDIO_DATASET as string,
  },
  deployment: {
    appId: '9f5ab0b8242bd92cc5f40adb',
  },
})
