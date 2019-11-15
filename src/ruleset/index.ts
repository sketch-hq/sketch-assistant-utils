import { RuleSet } from '../types'
import { ruleModule as debugAllOptions } from './debug-all-options'
import { ruleModule as debugThrowsError } from './debug-throws-error'
import { ruleModule as groupsMaxLayers } from './groups-max-layers'
import { ruleModule as imagesNoOutsized } from './images-no-outsized'
import { ruleModule as layersNoHidden } from './layers-no-hidden'

const ruleSet: RuleSet = {
  id: 'sketch',
  title: 'Sketch Core',
  description: 'A core set of rules curated by Sketch',
  rules: [
    debugAllOptions,
    debugThrowsError,
    groupsMaxLayers,
    imagesNoOutsized,
    layersNoHidden,
  ],
}

export { ruleSet }
