import * as DenoPath from "https://deno.land/std@0.170.0/path/mod.ts"
import { PurePathLike } from "./PurePathLike.ts"

export class PathLike extends PurePathLike {
  cwd() {
      return new PathLike(Deno.cwd())
  }
}