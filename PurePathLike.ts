import * as DenoPath from "https://deno.land/std@0.170.0/path/mod.ts"


export class PurePathLike {
  path = ""
  parts: Array<string> = []
  drive = ""
  root = ""
  anchor = ""
  name = ""
  suffixes: Array<string> = []
  suffix = ""
  stem = ""
  parents: () => Array<PurePathLike>;
  parent: PurePathLike;
  

  constructor(
    ...paths: Array<string | PurePathLike>
  ) {
    if (paths[0] == undefined){ throw new Error("At least one input is needed") }
    
    const args = paths.map(arg => (typeof arg == "string") ? arg : arg.path)
    const reviesed = (args[0].match(/\w:$/) && args.length >= 2)
        ? [args[0]+args[1], ...args.slice(2)]
        : args  // ["C:","Users","Default"] → OK:"C:Users/Default",  NOT："C:/Users/Default"
    const joined = DenoPath.join(...reviesed)
    this.path = joined.length > 1 && joined.endsWith(".") ? joined.slice(0, -1) : joined
    //console.log(this.path)

    if (this.path == "\\" || this.path == "/"){
      this.parts = [this.path]
      this.drive = ""
      this.root = this.path
      this.anchor = this.path
      this.name = ""
      this.suffixes = []
      this.suffix = ""
      this.stem = ""
      this.parents = () => []
      this.parent = this
      return
    }
    else if (this.path == ".") {
      this.parts = []
      this.drive = ""
      this.root = ""
      this.anchor = ""
      this.name = ""
      this.suffixes = []
      this.suffix = ""
      this.stem = ""
      this.parents = () => []
      this.parent = this
      return
    }

    const { root: anchor, dir:sub, name:stem, ext:suffix, base:name } = DenoPath.parse(this.path)
    this.anchor = anchor
    this.stem = stem
    this.name = name

    if (suffix == ""){
      this.suffix = suffix
      this.suffixes = [ ]
    } else {
      this.suffix = suffix.startsWith(".") ? suffix : "."+ suffix
      this.suffixes = (stem.includes(".") ? [...stem.split(".").slice(1), suffix] : [suffix])
          .map(s => s.startsWith(".") ? s : "."+s)
    }

    if (anchor != "" && anchor.match(/^\w:/)){
      const drive = anchor.match(/^\w:/)
      this.drive = drive![0]
      this.root = anchor.replace(this.drive, "")
    } else {
      this.drive = ""
      this.root = ""
    }
    const splited = this.path.includes("\\")
      ? [ this.anchor, ...sub.replace(this.anchor, "").split("\\"), this.name ]
      : [ this.anchor, ...sub.replace(this.anchor, "").replace("./", "").split("/"), this.name ]
    this.parts = splited.filter(x => x != "")

    if (this.parts.length == 1){
      if (this.parts[0] == this.anchor){
        this.parent = this
        this.parents = () => []
      } else {
        const dot = new PurePathLike(".")
        this.parent = dot
        this.parents = () => [dot]
      }
    }
    else if (this.parts.length == 2){
      this.parent = new PurePathLike(this.parts[0])
      this.parents = () => [this.parent]
    }
    else if (this.parts.length == 3){
      const top_par = new PurePathLike(this.parts[0])
      this.parent = new PurePathLike(
        (this.anchor != "") ? this.parts.slice(0,-1).join("") : DenoPath.join(...this.parts.slice(0,-1))
      )
      this.parents = () => [ top_par, this.parent ]
    }
    else {
      const top_par = new PurePathLike(this.parts[0])
      const second_par = new PurePathLike(
        (this.anchor != "") ? this.parts.slice(0,2).join("") : DenoPath.join(...this.parts.slice(0,2))
      )
      this.parent = new PurePathLike(second_par, ...this.parts.slice(2,-1))
      this.parents = () => this.parts.slice(2,-1).reduce( (combineds, part) => {
          combineds.push( new PurePathLike(combineds.at(-1)!, part) )
          return combineds
        },
        [top_par, second_par]
      )
    }
  }
}