import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { defineNuxtModule } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  enabled: boolean
  hash: string
  crossorigin: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-sri',
    configKey: 'sri',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    enabled: true,
    hash: 'sha384',
    crossorigin: 'anonymous',
  },
  setup(_options, _nuxt) {
    _nuxt.hook('build:manifest', async (manifest) => {
      if (!_options.enabled) {
        return
      }
      // Generate SRI hashes for each asset
      for (const asset of Object.values(manifest)) {
        if (asset.src) {
          try {
            const data = await readFile(asset.src) // Make sure this is the correct path
            const hash = createHash(_options.hash).update(data).digest('base64')
            asset.integrity = `${_options.hash}-${hash}`
            asset.crossorigin = _options.crossorigin
          }
          catch (error) {
            console.error('Failed to process', asset.src, ':', error.message)
          }
        }
      }
    })
  },
})
