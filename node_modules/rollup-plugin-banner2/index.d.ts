import * as rollup from 'rollup'

type Falsy = false | 0 | '' | null | undefined

type Stringifiable = { toString: () => string }

/**
 * The `resolveBanner` function returns a banner as
 * - `string`
 * - stringifiable object, i.e. having `toString` method, such as `Buffer`
 * - any falsy value for an empty banner
 * - a `Promise` resolving any of the values mentioned above
 */
type ResolveBanner = (
  chunk: rollup.RenderedChunk,
  options: rollup.OutputOptions,
) => string | Falsy | Stringifiable | Promise<string | Falsy | Stringifiable>

type FormatterOption = 'docBlock' | 'docBlockAndGap'
type Options = {
  /**
   * Set `false` to explicitly disable sourcemaps.
   * `true` by default
   */
  sourcemap?: boolean
  /**
   * Transform the resolved banner string
   *
   * @example
   * banner2(() => 'banner', { formatter: 'docBlock' })
   * // outputs multiline comment similar to:
   *  /**
   *   * banner
   *   * /
   */
  formatter?: FormatterOption
}

declare function banner2(
  resolveBanner: ResolveBanner,
  options?: Options,
): rollup.Plugin

export default banner2
