import {source} from '../config'
import {task, watch, series, dest} from 'gulp'
import {createProject} from 'gulp-typescript'
import * as sourcemaps from 'gulp-sourcemaps'
import * as log from 'fancy-log'

// Has to be a hardcoded object due to build order
const packages = {
  utils: createProject('packages/utils/tsconfig.json'),
  web: createProject('packages/web/tsconfig.json'),
  mongoose: createProject('packages/mongoose/tsconfig.json')
}

const modules = Object.keys(packages)

const distId = process.argv.indexOf('--dist')
const dist = distId < 0 ? source : process.argv[distId + 1]

/**
 * Watches the packages/* folder and
 * builds the package on file change
 */
function defaultTask () {
  log.info('Watching files..')
  modules.forEach(packageName => {
    watch(
      [`${source}/${packageName}/**/*.ts`, `${source}/${packageName}/*.ts`],
      series(packageName)
    )
  })
}

/**
 * Builds the given package
 * @param packageName The name of the package
 */
function buildPackage (packageName: string) {
  return packages[packageName]
    .src()
    .pipe(packages[packageName]())
    .pipe(dest(`${dist}/${packageName}`))
}

/**
 * Builds the given package and adds sourcemaps
 * @param packageName The name of the package
 */
function buildPackageDev (packageName: string) {
  return packages[packageName]
    .src()
    .pipe(sourcemaps.init())
    .pipe(packages[packageName]())
    .pipe(
      sourcemaps.mapSources(
        (sourcePath: string) => './' + sourcePath.split('/').pop()
      )
    )
    .pipe(sourcemaps.write('.', {}))
    .pipe(dest(`${dist}/${packageName}`))
}

modules.forEach(packageName => {
  task(packageName, () => buildPackage(packageName))
  task(`${packageName}:dev`, () => buildPackageDev(packageName))
})

task('common:dev', series(modules.map(packageName => `${packageName}:dev`)))
task('build', series(modules))
task('build:dev', series('common:dev'))
task('default', defaultTask)
