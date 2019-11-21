import {initFixtureData} from '@akajs/mongoose'

export {clearDB, closeDB} from '@akajs/mongoose'

export async function initData (filePath) {
  const file = filePath.replace('spec.ts', 'data.ts').replace('test.ts', 'data.ts')
  console.log('init test  data', file)
  try {
    const data = await import((file))
    await initFixtureData(data)
  } catch (err) {
    console.log('init file fail ', file, err.message)
  }
}
