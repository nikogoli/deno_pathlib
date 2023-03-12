import * as DenoPath from "https://deno.land/std@0.170.0/path/mod.ts"
import * as DenoFS from "https://deno.land/std@0.177.0/fs/mod.ts"

// deno-lint-ignore no-explicit-any
type NotPromise<T> = T extends Promise<any> ? never : T

type DistMerge<
  T extends Record<string,unknown>,
  S extends Record<string,unknown>
  // deno-lint-ignore no-explicit-any
> = S extends any ? { [K in keyof (T&S)]: (T&S)[K] } : never

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
    if (paths.length == 0){ // PathLike().cwd() のために許容する
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
    }
    else if (paths.length > 1 && paths.some(t => t === undefined || t === null)){
      const index = paths.findIndex(t => t === undefined || t === null)
      throw new Error(`The arg at index: ${index} is undefined / null.`)
    }
    
    const args = paths.map(arg => (typeof arg == "string") ? arg : arg.path)
    const reviesed = (args[0].match(/\w:$/) && args.length >= 2)
        ? [args[0]+args[1], ...args.slice(2)]
        : args  // ["C:","Users","Default"] → OK:"C:Users/Default",  NOT："C:/Users/Default"
    const joined = DenoPath.join(...reviesed)
    const raw_path = joined.length > 1 && joined.endsWith(".") ? joined.slice(0, -1) : joined
    this.path = (raw_path.startsWith("file:")) ? DenoPath.fromFileUrl(raw_path) : raw_path
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



export class PathLike extends PurePathLike {
  #_is_dir: boolean | undefined = undefined
  #_is_file: boolean | undefined = undefined
  #_is_symlink: boolean | undefined = undefined

  async copy(dest: string | PathLike, options?: DenoFS.CopyOptions) {
    const to = typeof dest == "string" ? dest : dest.path
    await DenoFS.copy(this.path, to, options)
  }

  cwd() {
    return new PathLike(Deno.cwd())
  }

  async chmod(mode:number) {
    await Deno.chmod(this.path, mode)
  }

  chmodSync(mode: number){
    Deno.chmodSync(this.path, mode)
  }

  async exists() {
    try {
      const _x = await this.stat()
      return true
    } catch (_error) {
      return false
    }
  }

  async ensureDir() {
    await DenoFS.ensureDir(this.parent().path)
  }

  existsSync() {
    try {
      const _x = this.stat()
      return true
    } catch (_error) {
      return false
    }
  }

  async dirFiles() {
    return await this.iterdirFilter(p => p.is_file())
  }

  async dirDirs() {
    return await this.iterdirFilter(p => p.is_dir())
  }

  is_dir() {
    if (this.#_is_dir){
      return this.#_is_dir
    } else {
      const info = Deno.lstatSync(this.path)
      this.#set_info(info.isDirectory, info.isFile, info.isSymlink)
      return info.isDirectory
    }
  }

  is_file() {
    if (this.#_is_file){
      return this.#_is_file
    } else {
      const info = Deno.lstatSync(this.path)
      this.#set_info(info.isDirectory, info.isFile, info.isSymlink)
      return info.isFile
    }
  }

  is_symlink() {
    if (this.#_is_symlink){
      return this.#_is_symlink
    } else {
      const info = Deno.lstatSync(this.path)
      this.#set_info(info.isDirectory, info.isFile, info.isSymlink)
      return info.isSymlink
    }
  }

  iterdir() {
    return Deno.readDir(this.path)
  }

  async iterdirMap<T>(
    callbackAsyncFunc: (value: PathLike, index: number) => NotPromise<T> | Promise<T>,
  ): Promise<Array<T>> {
    const outputs: Array<T> = []
    let i = 0
    for await (const entry of this.iterdir()){
      const p = this.joinpath(entry.name)
      const { isDirectory, isFile, isSymlink } = entry
      p.#set_info(isDirectory, isFile, isSymlink)
      outputs.push( await callbackAsyncFunc(p, i++) )
    }
    return outputs
  }

  async iterdirFilter(
    callbackAsyncFunc: (value: PathLike, index: number) => boolean | Promise<boolean>,
  ) {
    const outputs: Array<PathLike> = []
    let i = 0
    for await (const entry of this.iterdir()){
      const p = this.joinpath(entry.name)
      const { isDirectory, isFile, isSymlink } = entry
      p.#set_info(isDirectory, isFile, isSymlink)
      const is_ok = await callbackAsyncFunc(p, i++)
      if (is_ok){ outputs.push(p) }
    }
    return outputs
  }

  async iterdirFind (
    callbackSyncFunc: (value: PathLike, index?:number) => boolean | Promise<boolean>,
    type: "file" | "dir" | "both" = "file"
  ) {
    let found: PathLike | undefined = undefined
    let i = 0
    for await (const entry of this.iterdir()){
      if (found === undefined){
        const { isDirectory, isFile, isSymlink } = entry
        if ( (type == "both" && isSymlink == false) ||
              (type == "file" && isFile) ||
              (type == "dir" && isDirectory)
        ){
          const p = this.joinpath(entry.name)
          p.#set_info(isDirectory, isFile, isSymlink)
          const is_ok = await callbackSyncFunc(p, i++)
          if (is_ok){ found = p }
        }
      }
    }
    return found
  }

  async iterdirSome (
    callbackSyncFunc: (value: PathLike, index?:number) => boolean | Promise<boolean>,
    type: "file" | "dir" | "both" = "file"
  ) {
    let is_hit = false
    let i = 0
    for await (const entry of this.iterdir()){
      const { isDirectory, isFile, isSymlink } = entry
      if ( (type == "both" && isSymlink == false) ||
            (type == "file" && isFile) ||
            (type == "dir" && isDirectory)
      ){
        const p = this.joinpath(entry.name)
        p.#set_info(isDirectory, isFile, isSymlink)
        const is_ok = await callbackSyncFunc(p, i++)
        if (is_ok && is_hit == false){
          is_hit = true
        }
      }
    }
    return is_hit
  }

  async iterdirEvery (
    callbackSyncFunc: (value: PathLike, index?:number) => boolean | Promise<boolean>,
    type: "file" | "dir" | "both" = "file"
  ) {
    let all_is_true = true
    let i = 0
    for await (const entry of this.iterdir()){
      const { isDirectory, isFile, isSymlink } = entry
      if ( (type == "both" && isSymlink == false) ||
            (type == "file" && isFile) ||
            (type == "dir" && isDirectory)
      ){
        const p = this.joinpath(entry.name)
        p.#set_info(isDirectory, isFile, isSymlink)
        const is_ok = await callbackSyncFunc(p, i++)
        if (is_ok == false && all_is_true == true){
          all_is_true = false
        }
      }
    }
    return all_is_true
  }

  statSync() {
    return Deno.statSync(this.path)
  }

  async stat() {
    return await Deno.stat(this.path)
  }

  lstatSync() {
    return Deno.lstatSync(this.path)
  }

  async lstat() {
    return await Deno.lstat(this.path)
  }

  mkdirSync(
    option?: {mode?:number, parents?: boolean}
  ){
    const opt: Parameters<typeof Deno.mkdirSync>["1"] = option?.parents ? {...option, recursive: option.parents} : option
    Deno.mkdirSync(this.path, opt)
  }

  async mkdir(
    option?: {mode?:number, parents?: boolean}
  ){
    const opt: Parameters<typeof Deno.mkdirSync>["1"] = option?.parents ? {...option, recursive: option.parents} : option
    await Deno.mkdir(this.path, opt)
  }

  async move(dest: string | PathLike, overwrite?: true) {
    const to = typeof dest == "string" ? dest : dest.path
    await DenoFS.move(this.path, to, {overwrite})
  }

  openSync(option?: {
    mode? : "r" | "w" | "x" | "a",
    truncate?: true,
    create?: true,
    createNew?: true,
    PermissionMode?: number,
  }) {
    const opt:Deno.OpenOptions = {
      read: option?.mode == "r",
      write: option?.mode == "w" || option?.truncate || option?.create || option?.createNew,
      append: option?.mode == "a",
      truncate: option?.truncate,
      create: option?.create,
      createNew: option?.createNew,
      mode: option?.PermissionMode
    }

    if (option?.mode == "x"){
      try {
        const _x = this.statSync()
        throw new Error(`Path '${this.path}' already exists.`)
      } catch (_error) {
        return Deno.openSync(this.path, {...opt, write: true, create:true})
      }
    } else {
      return Deno.openSync(this.path, opt)
    }
  }
  
  async open(option?: {
    mode? : "r" | "w" | "x" | "a",
    truncate?: true,
    create?: true,
    createNew?: true,
    PermissionMode?: number,
  }) {
    const opt:Deno.OpenOptions = {
      read: option?.mode == "r",
      write: option?.mode == "w" || option?.truncate || option?.create || option?.createNew,
      append: option?.mode == "a",
      truncate: option?.truncate,
      create: option?.create,
      createNew: option?.createNew,
      mode: option?.PermissionMode
    }

    if (option?.mode == "x"){
      try {
        const _x = this.statSync()
        throw new Error(`Path '${this.path}' already exists.`)
      } catch (_error) {
        return Deno.openSync(this.path, {...opt, write: true, create:true})
      }    
    } else {
      return await Deno.open(this.path, opt)
    }
  }

  read_bytesSync() {
    return Deno.readFileSync(this.path)
  }

  async read_bytes() {
    return await Deno.readFile(this.path)
  }

  async read_text(encoding?: "utf-8" | string) {
    if (encoding && encoding != "utf-8"){
      const Decoder = new TextDecoder(encoding)
      return await Deno.readFile(this.path).then(dat => Decoder.decode(dat))
    } else {
      return await Deno.readTextFile(this.path)
    }
  }

  read_textSync(encoding?: "utf-8" | string) {
    if (encoding && encoding != "utf-8"){
      const Decoder = new TextDecoder(encoding)
      const dat = Deno.readFileSync(this.path)
      return Decoder.decode(dat)
    } else {
      return Deno.readTextFileSync(this.path)
    }
  }

  async read_lines(length?: number, encoding?: "utf-8" | string) {
    const text = await this.read_text(encoding)
    // ファイルの実態を確認しないので例外に弱く、使えない
    // const eol = DenoFS.detect(text) ?? (DenoPath.sep == "\\") ? DenoFS.EOL.CRLF : DenoFS.EOL.LF
    const lines = text.split(/\r\n|\r|\n/)
    return (length) ? lines.slice(0, length) : lines
  }

  read_linesSync(length?: number, encoding?: "utf-8" | string) {
    const text = this.read_textSync(encoding)
    const lines = text.split(/\r\n|\r|\n/)
    return (length) ? lines.slice(0, length) : lines
  }

  async read_JSON<T>() {
    return await Deno.readTextFile(this.path).then(tx => JSON.parse(tx) as T)
  }

  read_JSONSync<T>() {
    const j = Deno.readTextFileSync(this.path)
    return JSON.parse(j) as T
  }

  async readlink() {
    return await Deno.readLink(this.path)
  }

  readlinkSync() {
    return Deno.readLinkSync(this.path)
  }

  async rename(...args: Array<string | PurePathLike | PathLike>) {
    const new_p = new PathLike(...args)
    try {
      const _x = new_p.statSync()
    } catch (_error) {
      await Deno.rename(this.path, new_p.path)
      return new_p 
    }
    throw new Error(`target ${new_p.path} already exists.`)
  }

  renameSync(...args: Array<string | PurePathLike | PathLike>) {
    const new_p = new PathLike(...args)
    try {
      const _x = new_p.statSync()
    } catch (_error) {
      Deno.renameSync(this.path, new_p.path)
      return new_p
    }
    throw new Error(`target ${new_p.path} already exists.`)
  }

  async replace(...args: Array<string | PurePathLike | PathLike>) {
    const new_p = new PathLike(...args)
    await Deno.rename(this.path, new_p.path)
    return new_p 
  }

  replaceSync(...args: Array<string | PurePathLike | PathLike>) {
    const new_p = new PathLike(...args)
    Deno.renameSync(this.path, new_p.path)
    return new_p
  }

  resolve(strict?: true) {
    const resolved = new PathLike(DenoPath.resolve(this.path))
    if (strict){
      resolved.existsSync()
    }
    return resolved
  }

  async remove() {
    await Deno.remove(this.path)
  }

  removeSync() {
    Deno.removeSync(this.path)
  }

  async symlink(
    link_to:string | PurePathLike | PathLike,
    type: "file" | "dir"
  ) {
    const link_path = new PathLike(link_to).path
    await Deno.symlink(link_path, this.path, {type})
  }

  symlinkSync(
    link_to:string | PurePathLike | PathLike,
    type: "file" | "dir"
  ) {
    const link_path = new PathLike(link_to).path
    Deno.symlinkSync(link_path, this.path, {type})
  }

  async touch(option?:{
    mode?:number,
    exist_ok?:false
  }) {
    if (option?.exist_ok == false){
      const is_exist = await this.exists()
      if (is_exist){
        throw new Error(`path ${this.path} already exists.`)
      }
    }
    await DenoFS.ensureFile(this.path)
    if (option?.mode){
      await this.chmod(option.mode)
    }
  }


  touchSync(option? :{
    mode?:number,
    exist_ok?:false
  }) {
    if (option?.exist_ok == false){
      const is_exist = this.existsSync()
      if (is_exist){
        throw new Error(`path ${this.path} already exists.`)
      }
    }
    DenoFS.ensureFileSync(this.path)
    if (option?.mode){
      this.chmodSync(option.mode)
    }
  }

  to_resolve(...args: Array<string | PathLike>) {
    const target_path = new PathLike(...args).path
    const base_p = this.is_absolute() ? this : new PathLike(this).resolve()
    let original_path: null | string = null
    if (base_p.path != Deno.cwd()){
      original_path = Deno.cwd()
      Deno.chdir(base_p.parent().path)
    }
    const resolved_target = new PathLike(target_path).resolve()
    if (original_path){
      Deno.chdir(original_path)
    }
    return resolved_target
  }

  async write_bytes(
    data: Uint8Array,
    option?: {
      mode? : "x" | "a",
      create?: false,
      createNew?: true,
      PermissionMode?: number,
    }
  ) {
    if (option && option.mode == "x"){
      const is_exist = await this.exists()
      if (is_exist){
        throw new Error(`path ${this.path} is already exists.`)
      }
    }
    const opt:Deno.WriteFileOptions = {
      append: option?.mode == "a",
      create: option?.create,
      createNew: option?.createNew,
      mode: option?.PermissionMode
    }
    await Deno.writeFile(this.path, data, opt)
  }

  write_bytesSync(
    data: Uint8Array,
    option?: {
      mode? : "x" | "a",
      create?: false,
      createNew?: true,
      PermissionMode?: number,
    }
  ) {
    if (option && option.mode == "x"){
      const is_exist = this.existsSync()
      if (is_exist){
        throw new Error(`path ${this.path} is already exists.`)
      }
    }
    const opt:Deno.WriteFileOptions = {
      append: option?.mode == "a",
      create: option?.create,
      createNew: option?.createNew,
      mode: option?.PermissionMode
    }
    Deno.writeFileSync(this.path, data, opt)
  }

  async write_text(
    data: string,
    option?: {
      mode? : "x" | "a"
      create?: false,
      createNew?: true,
      PermissionMode?: number,
    }
  ) {
    if (option?.mode == "x"){
      const is_exist = this.existsSync()
      if (is_exist){
        throw new Error(`path ${this.path} is already exists.`)
      }
    }
    const opt:Deno.WriteFileOptions = {
      append: option?.mode == "a",
      create: option?.create,
      createNew: option?.createNew,
      mode: option?.PermissionMode
    }
    await Deno.writeTextFile(this.path, data, opt)
  }

  async write_JSON(
    // deno-lint-ignore no-explicit-any
    data: any,
    option?: {
      mode? : "x" | "a"
      create?: false,
      createNew?: true,
      PermissionMode?: number,
      // deno-lint-ignore no-explicit-any
      repalcer?: (this: any, key: string, value: any) => any
      space?: string | number
    }
  ) {
    const { repalcer, space } = option ? option : {repalcer: undefined, space:undefined}
    const j_data = JSON.stringify(data, repalcer, space)
    await this.write_text(j_data, option)
  }

  write_textSync(
    data: string,
    option?: {
      mode? : "x" | "a"
      create?: false,
      createNew?: true,
      PermissionMode?: number,
    }
  ) {
    if (option?.mode == "x"){
      const is_exist = this.existsSync()
      if (is_exist){
        throw new Error(`path ${this.path} is already exists.`)
      }
    }
    const opt:Deno.WriteFileOptions = {
      append: option?.mode == "a",
      create: option?.create,
      createNew: option?.createNew,
      mode: option?.PermissionMode
    }
    Deno.writeTextFileSync(this.path, data, opt)
  }

  write_JSONSync(
    // deno-lint-ignore no-explicit-any
    data: any,
    option?: {
      mode? : "x" | "a"
      create?: false,
      createNew?: true,
      PermissionMode?: number,
      // deno-lint-ignore no-explicit-any
      repalcer?: (this: any, key: string, value: any) => any
      space?: string | number
    }
  ) {
    const { repalcer, space } = option ? option : {repalcer: undefined, space:undefined}
    const j_data = JSON.stringify(data, repalcer, space)
    this.write_textSync(j_data, option)
  }

  #set_info(is_d:boolean, is_f:boolean, is_s:boolean){
    this.#_is_dir = is_d
    this.#_is_file = is_f
    this.#_is_symlink = is_s
  }
}


