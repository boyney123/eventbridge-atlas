import fs from 'fs-extra'
import path from 'path'

export default async ({ registry }) => {
  await fs.writeFile(path.join(__dirname, './lib/data/registry.json'), registry.toString())
}
