import * as DenoPath from "https://deno.land/std@0.170.0/path/mod.ts"
import * as DenoFS from "https://deno.land/std@0.177.0/fs/mod.ts"


type NotPromise<T> = T extends Promise<any> ? never : T


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
  parents: () => Array<PurePathLike | PathLike>;
  parent: () => PurePathLike | PathLike;
  

  constructor(
    ...paths: Array<string | PurePathLike | PathLike>
  ) {
    if (paths[0] == undefined){ // PathLike().cwd() のために許容する
      this.parts = [""]
      this.drive = ""
      this.root = ""
      this.anchor = ""
      this.name = ""
      this.suffixes = []
      this.suffix = ""
      this.stem = ""
      this.parents = () => []
      this.parent = () => this
      return
      // throw new Error("At least one input is needed")
    }
    
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
      this.parent = () => this
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
      this.parent = () => this
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
        this.parent = () => this
        this.parents = () => []
      } else {
        const dot = new PathLike(".")
        this.parent = () => dot
        this.parents = () => [dot]
      }
    }
    else if (this.parts.length == 2){
      this.parent = () => new PathLike(this.parts[0])
      this.parents = () => [this.parent()]
    }
    else if (this.parts.length == 3){
      const top_par = new PathLike(this.parts[0])
      this.parent = () => new PathLike(
        (this.anchor != "") ? this.parts.slice(0,-1).join("") : DenoPath.join(...this.parts.slice(0,-1))
      )
      this.parents = () => [ top_par, this.parent() ]
    }
    else {
      const top_par = new PathLike(this.parts[0])
      const second_par = new PathLike(
        (this.anchor != "") ? this.parts.slice(0,2).join("") : DenoPath.join(...this.parts.slice(0,2))
      )
      this.parent = () => new PathLike(second_par, ...this.parts.slice(2,-1))
      this.parents = () => this.parts.slice(2,-1).reduce( (combineds, part) => {
          combineds.push( new PathLike(combineds.at(-1)!, part) )
          return combineds
        },
        [top_par, second_par]
      )
    }
  }


  as_posix() {
    return this.path.replaceAll("\\", "/")
  }


  as_uri() {
    return DenoPath.toFileUrl(this.path).href
  }


  is_absolute(){
    return DenoPath.isAbsolute(this.path)
  }


  is_relative_to(target: string | PurePathLike | PathLike): boolean {
    const temp = typeof target == "string" ? new PathLike(target) : target
    const is_not_match = temp.parts.map((part,idx) => part == this.parts[idx]).some(x => x === false)
    return !is_not_match
  }

  
  joinpath(...args: Array<string | PurePathLike | PathLike>) {
    return new PathLike(this.path, ...args)
  }


  match(pattern: string | RegExp) {
    const reg_ptn = (pattern instanceof RegExp) ? pattern : DenoPath.globToRegExp(pattern)
    return this.path.match(reg_ptn) !== null
  }


  relative_to(target: string | PurePathLike | PathLike) {
    const temp = typeof target == "string" ? new PathLike(target) : target
    if (this.is_absolute() == temp.is_absolute()){
      const is_not_match = temp.parts.map((part,idx) => part == this.parts[idx]).some(x => x === false)
      if (is_not_match == false){
        if (this.path == temp.path){
          return new PathLike(".")
        } else {
          const sub_parts = this.parts.filter(x => temp.parts.includes(x) == false)
          return new PathLike(...sub_parts)
        }
      } else {
        throw new Error(`'${this.path}' is not in the subpath of '${temp.path}'`)
      }
    } else {
      throw new Error("One path is relative and the other absolute.")
    }
  }


  with_name(name:string) {
    if (this.name == ""){
      throw new Error("Cannot replace when original path's name is empty")
    }
    if (this.parent().path == "."){
      return new PathLike(name)
    } else {
      return new PathLike(this.parent(), name)
    }
  }


  with_stem(stem:string) {
    if (this.stem == ""){
      throw new Error("Cannot replace when original path's stem is empty")
    }
    if (this.parent().path == "."){
      return new PathLike(`${stem}${this.suffix}`)
    } else {
      return new PathLike(this.parent(), `${stem}${this.suffix}`)
    }
  }

  with_suffix(suffix:string){
    if (this.name == ""){
      throw new Error("Cannot replace when original path's name is empty")
    }
    const new_suf = suffix.startsWith(".") ? suffix : "." + suffix
    if (this.parent().path == "."){
      return new PathLike(`${this.stem}${new_suf}`)
    } else {
      return new PathLike(this.parent(), `${this.stem}${new_suf}`)
    }
  }
}
    } else {
      return new PurePathLike(this.parent, `${this.stem}${new_suf}`)
    }
  }
}