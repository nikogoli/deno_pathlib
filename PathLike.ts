import * as DenoPath from "jsr:@std/path@1.0.9"
import * as DenoFS from "jsr:@std/fs@1.0.19"

// deno-lint-ignore no-explicit-any
type NotPromise<T> = T extends Promise<any> ? never : T

type DistMerge<
  T extends Record<string,unknown>,
  S extends Record<string,unknown>
  // deno-lint-ignore no-explicit-any
> = S extends any ? { [K in keyof (T&S)]: (T&S)[K] } : never


export function r(template: Parameters<typeof String.raw>[0]){
  return String.raw(template)
}


export class PathLike {
  path = ""
  parts: Array<string> = []
  drive = ""
  root = ""
  anchor = ""
  name = ""
  suffixes: Array<string> = []
  suffix = ""
  stem = ""
  parents: () => Array<PathLike>;
  parent: () => PathLike;
  #_is_dir: boolean | undefined = undefined;
  #_is_file: boolean | undefined = undefined;
  #_is_symlink: boolean | undefined = undefined;
  

  constructor(
    ...paths: Array<string | PathLike>
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


  /**
   * このパスをPOSIX 形式に変換した文字列を返す
   */
  as_posix() {
    return this.path.replaceAll("\\", "/")
  }


  /**
   * このパスを絶対パス かつ FileURL 形式に変換した文字列を返す
   */
  as_uri() {
    return DenoPath.toFileUrl(this.resolve().path).href
  }



  /**
   * このパスが絶対パスなら true, 相対パスなら false を返す
   */
  is_absolute(){
    return DenoPath.isAbsolute(this.path)
  }


  /**
   * このパスの末尾に args を順番に結合した、新しい PathLike のインスタンスを返す
   * @param args パスに追加したい文字列あるいは PathLike インスタンスの配列
   */
  joinpath(...args: Array<string | PathLike>) {
    return new PathLike(this.path, ...args)
  }


  /**
   * このパスが与えられた pattern に一致する場合は true, 一致しない場合は false を返す
   * @param pattern 一致するかどうかを調べる対象の文字列あるいは RegExp
   */
  match(pattern: string | RegExp) {
    const reg_ptn = (pattern instanceof RegExp) ? pattern : DenoPath.globToRegExp(pattern)
    return this.path.match(reg_ptn) !== null
  }


  /**
   * このパスの name 部分を与えられた name に置き換えた、新しい PathLike インスタンスを返す
   * @param name 新しい名前
   */
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


  /**
   * このパスの stem 部分を与えられた stem に置き換えた、新しい PathLike インスタンスを返す
   * @param stem 新しい stem
   */
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


  /**
   * このパスの suffix 部分を与えられた suffix に置き換えた、新しい PathLike インスタンスを返す
   * @param suffix 新しい識別子
   */
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


  //  ↑ PurePath-method   ↓ Path-method


  /**
   * このパスが指す対象を与えられた dest に複製し、複製後のパスを示す PathLike インスタンスを返す。
   * 複製先がすでに存在する場合は error を投げる
   * - `{overwrite:true}`が与えられた場合は error を投げずに上書きを行う
   * @param dest 複製後のパスを示す文字列あるいは PathLike インスタンス
   * @param options 
   */
  async copy(dest: string | PathLike, options?: {overwrite?: true, preserveTimestamps?: true}) {
    const dest_p = typeof dest == "string" ? new PathLike(dest) : dest
    const opt: Parameters<typeof DenoFS.copy>[2] = options
    await DenoFS.copy(this.path, dest_p.path, opt)
    return dest_p
  }


  /**
   * このパスが指す対象を与えられた dest 直下に複製し、複製後のパスを示す PathLike インスタンスを返す。
   * dest の指す対象がディレクトリデない場合、および複製先がすでに存在する場合は error を投げる
   * - `{overwrite:true}`が与えられた場合は error を投げずに上書きを行う
   * @param dest 複製後の親となるディレクトリを示す文字列あるいは PathLike インスタンス
   * @param options 
   */
  async copyInto(
    dest: string | PathLike,
    options?: {overwrite?: true, preserveTimestamps?: true}
  ){
    const dest_dir = typeof dest == "string" ? new PathLike(dest) : dest
    if (dest_dir.is_dir() === false){
      throw new Error(`dest-path ${dest_dir.path} is not directory.`)  
    }
    const dest_p = new PathLike(dest, this.name)
    const opt: Parameters<typeof DenoFS.copy>[2] = options
    await DenoFS.copy(this.path, dest_p.path, opt)
    return dest_p
  }

  
  /**
   * カレントディレクトリのパスを示す PathLike インスタンスを返す
   */
  cwd() {
    return new PathLike(Deno.cwd())
  }


  /**
   * Deno.chmod を用い、このパスが指すファイルのモードとアクセス権限を変更する
   * @param mode 
   */
  async chmod(mode:number) {
    await Deno.chmod(this.path, mode)
  }


  /**
   * Deno.chmodSync を用い、このパスが指すファイルのモードとアクセス権限を同期的に変更する
   * @param mode 
   */
  chmodSync(mode: number){
    Deno.chmodSync(this.path, mode)
  }


  /**
   * このパスが指す対象の存在を調べ、存在するならその PathLike インスタンス, 存在しないなら false を返す。
   * - `throw_error=true`が与えられたとき、存在しない場合は false を返す代わりに error を投げる
   * @param throw_error 存在しない場合に error を投げるかどうか
   */
  async exists(throw_error?: true) {
    try {
      const _x = await this.stat()
      return this
    } catch (error) {
      if (throw_error){
        throw error
      } else {
        return false
      }
    }
  }

  /**
   * このパスが指す対象の存在を同期的に調べ、存在するならその PathLike インスタンス, 存在しないなら false を返す。
   * - `throw_error=true`が与えられたとき、存在しない場合は false を返す代わりに error を投げる
   * @param throw_error 存在しない場合に error を投げるかどうか
   */
  existsSync(throw_error?: true) {
    try {
      const _x = this.stat()
      return true
    } catch (error) {
      if (throw_error){
        throw error
      } else {
        return false
      }
    }
  }


  /**
   * このパスが指すディレクトリが存在するかどうかを調べ、存在しない場合はディレクトリを作成し、その PathLike インスタンスを返す。
   * - `{is_file:true}`が与えられたときは、自身の親のパスが示すディレクトリを対象にする
   * @param options is_file: 自身ではなく親のパスを用いるかどうか
   */
  async ensureDir(options?:{is_file: true}) {
    await DenoFS.ensureDir(options?.is_file ? this.parent().path : this.path)
    return this
  }


  /**
   * このパスが指すディレクトリを調べ、その直下にあるファイルを指す PathLike インスタンスの配列を返す
   */
  async dirFiles() {
    return await this.iterdirFilter(p => p.is_file())
  }


  /**
   * このパスが指すディレクトリを調べ、その直下にあるディレクトリを指す PathLike インスタンスの配列を返す
   */
  async dirDirs() {
    return await this.iterdirFilter(p => p.is_dir())
  }


  /**
   * このパスが指す対象がディレクトリであれば true, それ以外ならば false を返す
   */
  is_dir() {
    if (this.#_is_dir){
      return this.#_is_dir
    } else {
      const info = Deno.lstatSync(this.path)
      this.#set_info(info.isDirectory, info.isFile, info.isSymlink)
      return info.isDirectory
    }
  }


  /**
   * このパスが指す対象がファイルであれば true, それ以外ならば false を返す
   */
  is_file() {
    if (this.#_is_file){
      return this.#_is_file
    } else {
      const info = Deno.lstatSync(this.path)
      this.#set_info(info.isDirectory, info.isFile, info.isSymlink)
      return info.isFile
    }
  }


  /**
   * このパスが指す対象がシンボリックリンクであれば true, それ以外ならば false を返す
   */
  is_symlink() {
    if (this.#_is_symlink){
      return this.#_is_symlink
    } else {
      const info = Deno.lstatSync(this.path)
      this.#set_info(info.isDirectory, info.isFile, info.isSymlink)
      return info.isSymlink
    }
  }


  /**
   * このパスを対象に`Deno.readDir()`を実行し Deno.DirEntry の async iterable を返す
   */
  iterdir() {
    return Deno.readDir(this.path)
  }


  /**
   * このパスが指すディレクトリ直下の要素に対して与えられた callback を順番に非同期的に実行し、
   * それらの結果が含まれた配列を返す
   * @param callbackAsyncFunc ディレクトリの中身に対して実行する関数。非同期でなくても構わない
   */
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


  /**
   * このパスが指すディレクトリ直下の要素に対して与えられた callback を順番に非同期的に実行し、
   * その結果が true になった PathLike のインスタンスのみからなる配列を返す
   * @param callbackAsyncFunc ディレクトリの中身に対して実行する関数。非同期でなくても構わない
   */
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


  /**
   * このパスが指すディレクトリ直下の要素に対して与えられた callback を順番に非同期的に実行し、
   * その結果が最初に true になった PathLike のインスタンスを返す
   * @param callbackAsyncFunc ディレクトリの中身に対して実行する関数。非同期でなくても構わない
   * @param type callback を実行する対象の絞り込み。デフォルトは`"file"`
   */
  async iterdirFind (
    callbackAsyncFunc: (value: PathLike, index?:number) => boolean | Promise<boolean>,
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
          const is_ok = await callbackAsyncFunc(p, i++)
          if (is_ok){ found = p }
        }
      }
    }
    return found
  }


  /**
   * このパスが指すディレクトリ直下の要素に対して与えられた callback を順番に非同期的に実行し、
   * 一つでも結果が true になったものがあれば true, すべての結果が false であれば false を返す。
   * @param callbackAsyncFunc ディレクトリの中身に対して実行する関数。非同期でなくても構わない
   * @param type callback を実行する対象の絞り込み。デフォルトは`"file"`
   */
  async iterdirSome (
    callbackAsyncFunc: (value: PathLike, index?:number) => boolean | Promise<boolean>,
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
        const is_ok = await callbackAsyncFunc(p, i++)
        if (is_ok && is_hit == false){
          is_hit = true
        }
      }
    }
    return is_hit
  }


  /**
   * このパスが指すディレクトリ直下の要素に対して与えられた callback を順番に非同期的に実行し、
   * 結果がすべて true であれば true, 一つでも false になった場合は false を返す。
   * @param callbackAsyncFunc ディレクトリの中身に対して実行する関数。非同期でなくても構わない
   * @param type callback を実行する対象の絞り込み。デフォルトは`"file"`
   */
  async iterdirEvery (
    callbackAsyncFunc: (value: PathLike, index?:number) => boolean | Promise<boolean>,
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
        const is_ok = await callbackAsyncFunc(p, i++)
        if (is_ok == false && all_is_true == true){
          all_is_true = false
        }
      }
    }
    return all_is_true
  }


  /**
   * このパスが指す対象に同期的に Deno.statSync を実行し、Deno.FileInfo を返す。
   * 対象がシンボリックリンクであった場合、リンク先における Deno.FileInfo を返す。
   */
  statSync() {
    return Deno.statSync(this.path)
  }


  /**
   * このパスが指す対象に Deno.stat を実行し、Deno.FileInfo を返す。
   * 対象がシンボリックリンクであった場合、リンク先における Deno.FileInfo を返す。
   */
  async stat() {
    return await Deno.stat(this.path)
  }


  /**
   * このパスが指す対象に同期的に Deno.lstatSync を実行し、Deno.FileInfo を返す。
   * 対象がシンボリックリンクであった場合、シンボリックリンクにおける Deno.FileInfo を返す。
   */
  lstatSync() {
    return Deno.lstatSync(this.path)
  }


  /**
   * このパスが指す対象に Deno.lstat を実行し、Deno.FileInfo を返す。
   * 対象がシンボリックリンクであった場合、シンボリックリンクにおける Deno.FileInfo を返す。
   */
  async lstat() {
    return await Deno.lstat(this.path)
  }


  /**
   * このパスにディレクトリを同期的に作成する。すでにディレクトリが存在する場は error を投げる。
   * - `{recursive: true}`が与えられた場合、必要に応じて親ディレクトリも新規に作成する。
   * @param option Deno.MkdirOptions
   */
  mkdirSync(
    option?: {mode?:number, recursive?: boolean}
  ){
    const opt: Parameters<typeof Deno.mkdirSync>["1"] = option
    Deno.mkdirSync(this.path, opt)
  }


  /**
   * このパスにディレクトリを作成する。すでにディレクトリが存在する場は error を投げる。
   * - `{recursive: true}`が与えられた場合、必要に応じて親ディレクトリも新規に作成する。
   * @param option Deno.MkdirOptions
   */
  async mkdir(
    option?: {mode?:number, recursive?: boolean}
  ){
    const opt: Parameters<typeof Deno.mkdirSync>["1"] = option
    await Deno.mkdir(this.path, opt)
  }


  /**
   * このパスが指す対象を与えられた dest に移動させ、移動後のパスを示す PathLike インスタンスを返す。
   * 移動先がすでに存在する場合は error を投げる
   * - `overwrite=true`のとき、移動先がすでに存在する場合は error を投げずに上書きを行う
   * @param dest 移動後のパスを示す文字列あるいは PathLike インスタンス
   * @param overwrite 上書きを許容するかどうか
   */
  async move(dest: string | PathLike, overwrite?: true) {
    const dest_p = typeof dest == "string" ? new PathLike(dest) : dest
    await DenoFS.move(this.path, dest_p.path, {overwrite})
    return dest_p
  }


  /**
   * このパスが指す対象を与えられた dest の直下に移動させ、移動後のパスを示す PathLike インスタンスを返す。
   * dest が指す対象がディレクトリではない場合、および移動先がすでに存在する場合は error を投げる
   * - `overwrite=true`のとき、移動先がすでに存在する場合は error を投げずに上書きを行う。
   * @param dest 移動後の親となるディレクトリのパスを示す文字列あるいは PathLike インスタンス
   * @param overwrite 上書きを許容するかどうか
   */
  async moveInto(dest: string | PathLike, overwrite?: true) {
    const dest_dir = typeof dest == "string" ? new PathLike(dest) : dest
    if (dest_dir.is_dir() === false){
      throw new Error(`dest-path ${dest_dir.path} is not directory.`)  
    }
    const dest_p = new PathLike(dest, this.name)
    await DenoFS.move(this.path, dest_p.path, {overwrite})
    return dest_p
  }


  /**
   * このパスが指す対象に対して同期的に Deno.openSync を実行し、Deno.FsFile インスタンスを返す
   * @param option 
   */
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
  

  /**
   * このパスが指す対象に対して Deno.open を実行し、Deno.FsFile インスタンスを返す
   * @param option 
   */
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
        const _x = await this.stat()
        throw new Error(`Path '${this.path}' already exists.`)
      } catch (_error) {
        return await Deno.open(this.path, {...opt, write: true, create:true})
      }    
    } else {
      return await Deno.open(this.path, opt)
    }
  }


  /**
   * このパスが指す対象に対して同期的に Deno.readFileSync を実行し、Uint8Array を返す
   */
  read_bytesSync() {
    return Deno.readFileSync(this.path)
  }


  /**
   * このパスが指す対象に対して Deno.readFile を実行し、Uint8Array を返す
   */
  async read_bytes() {
    return await Deno.readFile(this.path)
  }


  /**
   * このパスが指す対象に対して Deno.readTextFile を実行し、文字列を返す
   * @param encoding エンコード形式の指定。デフォルトは`"utf-8"`
   */
  async read_text(encoding?: "utf-8" | string) {
    if (encoding && encoding != "utf-8"){
      const Decoder = new TextDecoder(encoding)
      return await Deno.readFile(this.path).then(dat => Decoder.decode(dat))
    } else {
      return await Deno.readTextFile(this.path)
    }
  }


  /**
   * このパスが指す対象に対して同期的に Deno.readTextFileSync を実行し、文字列を返す
   * @param encoding エンコード形式の指定。デフォルトは`"utf-8"`
   */
  read_textSync(encoding?: "utf-8" | string) {
    if (encoding && encoding != "utf-8"){
      const Decoder = new TextDecoder(encoding)
      const dat = Deno.readFileSync(this.path)
      return Decoder.decode(dat)
    } else {
      return Deno.readTextFileSync(this.path)
    }
  }


  /**
   * このパスが指す対象に対して Deno.readTextFile を実行し、その結果を改行文字で分割した文字列の配列を返す
   * @param encoding エンコード形式の指定。デフォルトは`"utf-8"`
   */
  async read_lines(length?: number, encoding?: "utf-8" | string) {
    const text = await this.read_text(encoding)
    // ファイルの実態を確認しないので例外に弱く、使えない
    // const eol = DenoFS.detect(text) ?? (DenoPath.sep == "\\") ? DenoFS.EOL.CRLF : DenoFS.EOL.LF
    const lines = text.split(/\r\n|\r|\n/)
    return (length) ? lines.slice(0, length) : lines
  }


  /**
   * このパスが指す対象に対して同期的に Deno.readTextFileSync を実行し、その結果を改行文字で分割した文字列の配列を返す
   * @param encoding エンコード形式の指定。デフォルトは`"utf-8"`
   */
  read_linesSync(length?: number, encoding?: "utf-8" | string) {
    const text = this.read_textSync(encoding)
    const lines = text.split(/\r\n|\r|\n/)
    return (length) ? lines.slice(0, length) : lines
  }


  /**
   * このパスが指す対象に対して Deno.readTextFile を実行し、その結果にさらに JSON.parse() を実行した結果を返す
   */
  async read_JSON<T>() {
    return await Deno.readTextFile(this.path).then(tx => JSON.parse(tx) as T)
  }


  /**
   * このパスが指す対象に対して同期的に Deno.readTextFileSync を実行し、その結果にさらに JSON.parse() を実行した結果を返す
   */
  read_JSONSync<T>() {
    const j = Deno.readTextFileSync(this.path)
    return JSON.parse(j) as T
  }


  /**
   * このパスが指すシンボリックリンクをたどり、リンク先へのパスを文字列として返す
   */
  async readlink() {
    return await Deno.readLink(this.path)
  }


  /**
   * このパスが指すシンボリックリンクを同期的にたどり、リンク先へのパスを文字列として返す
   */
  readlinkSync() {
    return Deno.readLinkSync(this.path)
  }


  /**
   * このパスを基準にして args として与えられた相対パスを解決し、その PathLike インスタンスを返す
   * @param args 解決したい相対パスを構成する文字列あるいは PathLike インスタンスの配列
   */
  resolveRelative(...args: Array<string | PathLike>) {
    const target_path = new PathLike(...args).path
    const base_p = this.is_absolute() ? this : new PathLike(this).resolve()
    let original_path: null | string = null
    if (base_p.path != Deno.cwd()){
      original_path = Deno.cwd()
      Deno.chdir( base_p.is_file() ? base_p.parent().path : base_p.path)
    }
    const resolved_target = new PathLike(target_path).resolve()
    if (original_path){
      Deno.chdir(original_path)
    }
    return resolved_target
  }


  /**
   * このパスが指す対象を、与えられた args から構成される新しいパスにリネーム(移動)する。
   * リネーム先がすでに存在する場合は error を投げる。
   * @param args リネーム先のパスを構成する文字列あるいは PathLike インスタンスの配列
   */
  async rename(...args: Array<string | PathLike>) {
    const new_p = new PathLike(...args)
    try {
      const _x = new_p.statSync()
    } catch (_error) {
      await Deno.rename(this.path, new_p.path)
      return new_p 
    }
    throw new Error(`target ${new_p.path} already exists.`)
  }


  /**
   * このパスが指す対象を、与えられた args から構成される新しいパスに同期的にリネーム(移動)する。
   * リネーム先がすでに存在する場合は error を投げる。
   * @param args リネーム先のパスを構成する文字列あるいは PathLike インスタンスの配列
   */
  renameSync(...args: Array<string | PathLike>) {
    const new_p = new PathLike(...args)
    try {
      const _x = new_p.statSync()
    } catch (_error) {
      Deno.renameSync(this.path, new_p.path)
      return new_p
    }
    throw new Error(`target ${new_p.path} already exists.`)
  }


  /**
   * このパスが指す対象の name を与えられた new_name に変更する。
   * リネーム先がすでに存在する場合は error を投げる。
   * @param new_name 新しい name
   */
  async renameTo(new_name:string) {
    const new_p = this.with_name(new_name)
    try {
      const _x = new_p.statSync()
    } catch (_error) {
      await Deno.rename(this.path, new_p.path)
      return new_p 
    }
    throw new Error(`target ${new_p.path} already exists.`)
  }


  /**
   * このパスが指す対象を、与えられた args から構成される新しいパスにリネーム(移動)する。
   * リネーム先がすでに存在する場合は上書きする。
   * @param args リネーム先のパスを構成する文字列あるいは PathLike インスタンスの配列
   */
  async replace(...args: Array<string | PathLike>) {
    const new_p = new PathLike(...args)
    await Deno.rename(this.path, new_p.path)
    return new_p 
  }


  /**
   * このパスが指す対象を、与えられた args から構成される新しいパスに同期的にリネーム(移動)する。
   * リネーム先がすでに存在する場合は上書きする。
   * @param args リネーム先のパスを構成する文字列あるいは PathLike インスタンスの配列
   */
  replaceSync(...args: Array<string | PathLike>) {
    const new_p = new PathLike(...args)
    Deno.renameSync(this.path, new_p.path)
    return new_p
  }


  /**
   * このパスを絶対パスに変換し、そのパスを示す PathLike インスタンスを返す。
   * - `strict=true`の場合、パスの対象が存在しない場合は error を投げる
   * @param strict パスが示す対象の存在を確認するかどうか
   */
  resolve(strict?: true) {
    const resolved = new PathLike(DenoPath.resolve(this.path))
    if (strict){
      resolved.existsSync()
    }
    return resolved
  }


  /**
   * このパスが指す対象を削除する。対象がディレクトリかつ中身が存在する場合は error を投げる
   * - `{removeNonEmptyDir: true}`が与えられたとき、対象が空でないディレクトリの場合でも削除を行う
   * @param options removeNonEmptyDir：空でないディレクトリでも削除するかどうか
   */
  async remove(options?: {removeNonEmptyDir: true}) {
    const opt = options?.removeNonEmptyDir ? {recursive: true} : undefined
    await Deno.remove(this.path, opt)
  }


  /**
   * このパスが指す対象を同期的に削除する。対象がディレクトリかつ中身が存在する場合は error を投げる
   * - `{removeNonEmptyDir: true}`が与えられたとき、対象が空でないディレクトリの場合でも削除を行う
   * @param options removeNonEmptyDir：空でないディレクトリでも削除するかどうか
   */
  removeSync(options?: {removeNonEmptyDir: true}) {
    const opt = options?.removeNonEmptyDir ? {recursive: true} : undefined
    Deno.removeSync(this.path, opt)
  }


  /**
   * このパスが示す場所に空のファイルを作成する。
   * - `mode`が与えられたとき、Deno.chmod(mode) を行う
   * - `{exist_ok=false}`が与えられたとき、このパスが指す対象がすでに存在する場合は error を投げる
   * @param option 
   */
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


  /**
   * このパスが示す場所に空のファイルを同期的に作成する
   * - `mode`が与えられたとき、Deno.chmod(mode) を行う
   * - `{exist_ok=false}`が与えられたとき、このパスが指す対象がすでに存在する場合は error を投げる
   * @param option 
   */
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


  /**
   * このパスが指すファイルに与えられた data を上書きする。ファイルが存在しない場合は新規に作成する。
   * - `{create: false}`あるいは`{mode: "x"}`が与えられた場合、ファイルが存在しない場合は error を投げる
   * - `{createNew: true}`が与えられた場合、このパスが指すファイルが存在する場合は error を投げる
   * - `{mode: "a"}`が与えられた場合、上書きではなく data を追加的に書き込む
   * @param data ファイルに書き込む Unit8Array
   * @param option 
   */
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


  /**
   * このパスが指すファイルに与えられた data を同期的に上書きする。ファイルが存在しない場合は新規に作成する。
   * - `{create: false}`あるいは`{mode: "x"}`が与えられた場合、ファイルが存在しない場合は error を投げる
   * - `{createNew: true}`が与えられた場合、このパスが指すファイルが存在する場合は error を投げる
   * - `{mode: "a"}`が与えられた場合、上書きではなく data を追加的に書き込む
   * @param data ファイルに書き込む Unit8Array
   * @param option 
   */
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


  /**
   * このパスが指すファイルに与えられた data を上書きする。ファイルが存在しない場合は新規に作成する。
   * - `{create: false}`あるいは`{mode: "x"}`が与えられた場合、ファイルが存在しない場合は error を投げる
   * - `{createNew: true}`が与えられた場合、このパスが指すファイルが存在する場合は error を投げる
   * - `{mode: "a"}`が与えられた場合、上書きではなく data を追加的に書き込む
   * @param data ファイルに書き込む文字列
   * @param option 
   */
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
    await Deno.writeTextFile(this.path, data, opt)
  }


  /**
   * このパスが指すファイルに与えられた data を同期的に上書きする。ファイルが存在しない場合は新規に作成する。
   * - `{create: false}`あるいは`{mode: "x"}`が与えられた場合、ファイルが存在しない場合は error を投げる
   * - `{createNew: true}`が与えられた場合、このパスが指すファイルが存在する場合は error を投げる
   * - `{mode: "a"}`が与えられた場合、上書きではなく data を追加的に書き込む
   * @param data ファイルに書き込む文字列
   * @param option 
   */
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


  /**
   * このパスが指すファイルに与えられた data を上書きする。ファイルが存在しない場合は新規に作成する。
   * - `{create: false}`あるいは`{mode: "x"}`が与えられた場合、ファイルが存在しない場合は error を投げる
   * - `{createNew: true}`が与えられた場合、このパスが指すファイルが存在する場合は error を投げる
   * - `{mode: "a"}`が与えられた場合、上書きではなく data を追加的に書き込む
   * - `replacer`および`space`が与えられた場合、それらは JSON.stringify() の引数となる
   * @param data ファイルに書き込むオブジェクト
   * @param option 
   */
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


  /**
   * このパスが指すファイルに与えられた data を同期的に上書きする。ファイルが存在しない場合は新規に作成する。
   * - `{create: false}`あるいは`{mode: "x"}`が与えられた場合、ファイルが存在しない場合は error を投げる
   * - `{createNew: true}`が与えられた場合、このパスが指すファイルが存在する場合は error を投げる
   * - `{mode: "a"}`が与えられた場合、上書きではなく data を追加的に書き込む
   * - `replacer`および`space`が与えられた場合、それらは JSON.stringify() の引数となる
   * @param data ファイルに書き込むオブジェクト
   * @param option 
   */
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