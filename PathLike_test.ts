import { assertEquals, assertIsError, assertNotEquals, assertExists,  } from "https://deno.land/std@0.170.0/testing/asserts.ts"
import * as DenoFS from "https://deno.land/std@0.177.0/fs/mod.ts"

import { PurePathLike, PathLike } from "./PathLike.ts"


const Absolute = {
  posix: "C:/Users/Default/AppData/Local/Microsoft/Windows/Shell/DefaultLayouts.tar.gz",
  windows: "C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz",
  parts: ["C:\\", "Users", "Default", "AppData", "Local", "Microsoft", "Windows", "Shell", "DefaultLayouts.tar.gz"],
  anchor: "C:\\",
  drive: "C:",
  root: "\\",
  name: "DefaultLayouts.tar.gz",
  stem: "DefaultLayouts.tar",
  suffixes: [".tar",".gz"],
  suffix: ".gz",
  parents_paths:[
    "C:\\",
    "C:\\Users",
    "C:\\Users\\Default",
    "C:\\Users\\Default\\AppData",
    "C:\\Users\\Default\\AppData\\Local",
    "C:\\Users\\Default\\AppData\\Local\\Microsoft",
    "C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows",
    "C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell"
  ],
  parent_path: "C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell",
}

const DotRela = {
  posix: "./Users/Default/AppData/Local/Microsoft/Windows/Shell/DefaultLayouts.tar.gz",
  windows: ".\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz",
  parts: ["Users", "Default", "AppData", "Local", "Microsoft", "Windows", "Shell", "DefaultLayouts.tar.gz"],
  anchor: "",
  drive: "",
  root: "",
  name: "DefaultLayouts.tar.gz",
  stem: "DefaultLayouts.tar",
  suffixes: [".tar",".gz"],
  suffix: ".gz",
  parents_paths:[
    "Users",
    "Users\\Default",
    "Users\\Default\\AppData",
    "Users\\Default\\AppData\\Local",
    "Users\\Default\\AppData\\Local\\Microsoft",
    "Users\\Default\\AppData\\Local\\Microsoft\\Windows",
    "Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell"
  ],
  parent_path: "Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell",
}

const Relative = {
  posix: "Users/Default/AppData/Local/Microsoft/Windows/Shell/DefaultLayouts.tar.gz",
  windows: "Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz",
  parts: ["Users", "Default", "AppData", "Local", "Microsoft", "Windows", "Shell", "DefaultLayouts.tar.gz"],
  anchor: "",
  drive: "",
  root: "",
  name: "DefaultLayouts.tar.gz",
  stem: "DefaultLayouts.tar",
  suffixes: [".tar",".gz"],
  suffix: ".gz",
  parents_paths:[
    "Users",
    "Users\\Default",
    "Users\\Default\\AppData",
    "Users\\Default\\AppData\\Local",
    "Users\\Default\\AppData\\Local\\Microsoft",
    "Users\\Default\\AppData\\Local\\Microsoft\\Windows",
    "Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell"
  ],
  parent_path: "Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell"
}

const NoRoot = {
  posix: "C:Users/Default/AppData/Local/Microsoft/Windows/Shell/DefaultLayouts.tar.gz",
  windows: "C:Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz",
  parts: ["C:", "Users", "Default", "AppData", "Local", "Microsoft", "Windows", "Shell", "DefaultLayouts.tar.gz"],
  anchor: "C:",
  drive: "C:",
  root: "",
  name: "DefaultLayouts.tar.gz",
  stem: "DefaultLayouts.tar",
  suffixes: [".tar",".gz"],
  suffix: ".gz",
  parents_paths:[
    "C:",
    "C:Users",
    "C:Users\\Default",
    "C:Users\\Default\\AppData",
    "C:Users\\Default\\AppData\\Local",
    "C:Users\\Default\\AppData\\Local\\Microsoft",
    "C:Users\\Default\\AppData\\Local\\Microsoft\\Windows",
    "C:Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell"
  ],
  parent_path: "C:Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell",
}

const AnchorAndName = {
  posix: "C:/DefaultLayouts.tar.gz",
  windows: "C:\\DefaultLayouts.tar.gz",
  parts: ["C:\\", "DefaultLayouts.tar.gz"],
  anchor: "C:\\",
  drive: "C:",
  root: "\\",
  name: "DefaultLayouts.tar.gz",
  stem: "DefaultLayouts.tar",
  suffixes: [".tar",".gz"],
  suffix: ".gz",
  parents_paths:[
    "C:\\"
  ],
  parent_path: "C:\\",
}

const AnchorAndSub = {
  posix: "C:/Users",
  windows: "C:\\Users",
  parts: ["C:\\", "Users"],
  anchor: "C:\\",
  drive: "C:",
  root: "\\",
  name: "Users",
  stem: "Users",
  suffixes: [],
  suffix: "",
  parents_paths:[
    "C:\\"
  ],
  parent_path: "C:\\",
}

const JustAnchor = {
  posix: "C:/",
  windows: "C:\\",
  parts: ["C:\\"],
  anchor: "C:\\",
  drive: "C:",
  root: "\\",
  name: "",
  stem: "",
  suffixes: [],
  suffix: "",
  parents_paths:[],
  parent_path: "C:\\",
}

const JustDrive = {
  posix: "C:",
  windows: "C:",
  parts: ["C:"],
  anchor: "C:",
  drive: "C:",
  root: "",
  name: "",
  stem: "",
  suffixes: [],
  suffix: "",
  parents_paths:[],
  parent_path: "C:",
}

const JustName = {
  posix: "DefaultLayouts.tar.gz",
  windows: "DefaultLayouts.tar.gz",
  parts: ["DefaultLayouts.tar.gz"],
  anchor: "",
  drive: "",
  root: "",
  name: "DefaultLayouts.tar.gz",
  stem: "DefaultLayouts.tar",
  suffixes: [".tar",".gz"],
  suffix: ".gz",
  parents_paths:[
    "."
  ],
  parent_path: ".",
}

const DotJustName = {
  posix: "./DefaultLayouts.tar.gz",
  windows: ".\\DefaultLayouts.tar.gz",
  parts: ["DefaultLayouts.tar.gz"],
  anchor: "",
  drive: "",
  root: "",
  name: "DefaultLayouts.tar.gz",
  stem: "DefaultLayouts.tar",
  suffixes: [".tar",".gz"],
  suffix: ".gz",
  parents_paths:[
    "."
  ],
  parent_path: ".",
}


const PathData = new Map<string, typeof Absolute>()
Object.entries({
  "絶対": Absolute,
  "ルートなし-絶対": NoRoot,
  "相対": Relative,
  "ドット始まり-相対": DotRela,
  "絶対-直下ファイル": AnchorAndName,
  "絶対-直下パス": AnchorAndSub,
  "絶対-アンカーのみ": JustAnchor,
  "絶対-ドライブのみ-ルートなし": JustDrive,
  "相対-ファイル名のみ": JustName,
  "相対-ドット始まり-ファイル名": DotJustName,
}).forEach(([k,v]) => PathData.set(k, v))


function same_check(A:PurePathLike, B:PurePathLike){
  assertEquals(A.drive, B.drive)
  assertEquals(A.root, B.root)
  assertEquals(A.anchor, B.anchor)
  assertEquals(A.name, B.name)
  assertEquals(A.stem, B.stem)
  assertEquals(A.suffix, B.suffix)
  assertEquals(A.suffixes, B.suffixes)
  assertEquals(A.parts, B.parts)
  assertEquals(A.parents().map(p => p.path), B.parents().map(p => p.path))
  assertEquals(A.parent().path, B.parent().path)
}

// ----------- construct ---------------
/*
Deno.test("作成：空入力はエラー", () => {
  try {
    new PurePathLike()
    throw new Error("Not Error")
  } catch (error) {
    assertIsError(error, Error, "At least one input is needed") 
  }
})
*/

// ------------- single input  --------------------
Deno.test("単一パス入力 → attr", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
    await t.step(`check ${label}`, async (_tt) => {
      const {
        posix, windows, drive, root, anchor, name, stem, suffix, suffixes, parts,
        parents_paths, parent_path } = data
      const base_by_win = new PurePathLike(windows)
      const base_by_posix = new PurePathLike(posix)

      const is_same = await _tt.step("OK: posix 経由と windows 経由のパスオブジェクトが等しい", () => {
        same_check(base_by_posix, base_by_win)
      })
      if (is_same == false){
        console.error(`${label} の same check が失敗したため以降を無視`)
        return
      }
      
      await _tt.step(`OK: ${label} の drive が正しい`, () => {
        assertEquals(base_by_win.drive, drive)
      })
      await _tt.step(`OK: ${label} の root が正しい`, () => {
        assertEquals(base_by_win.root, root)
      })
      await _tt.step(`OK: ${label} の anchor が正しい`, () => {
        assertEquals(base_by_win.anchor, anchor)
      })
      await _tt.step(`OK: ${label} の name が正しい`, () => {
        assertEquals(base_by_win.name, name)
      })
      await _tt.step(`OK: ${label} の stem が正しい`, () => {
        assertEquals(base_by_win.stem, stem)
      })
      await _tt.step(`OK: ${label} の suffix が正しい`, () => {
        assertEquals(base_by_win.suffix, suffix)
      })
      await _tt.step(`OK: ${label} の suffixes が正しい`, () => {
        assertEquals(base_by_win.suffixes, suffixes)
      })
      await _tt.step(`OK: ${label} の parts が正しい`, () => {
        assertEquals(base_by_win.parts, parts)
      })
      await _tt.step(`OK: ${label} の parents の path が正しい`, () => {
        assertEquals(base_by_win.parents().map(p => p.path), parents_paths)
      })
      await _tt.step(`OK: ${label} の parent の path が正しい`, () => {
        assertEquals(base_by_win.parent().path, parent_path)
      })
    })
  } ), Promise.resolve())
})

// 複合インプットは .joinpath() メソッドと実質的に同じなので省略

// ---------- methods ----------------------
Deno.test("メソッド as_posix: 区切り文字を '\\' から '/' に変換 (パス頭の './' は削除)", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
    const { posix, windows } = data
    const actual = new PurePathLike(windows).as_posix()
    await t.step(`OK: ${label} を ${posix.replace("./", "")} に変換`, () => {
      assertEquals(actual, posix.replace("./", ""))
    })
  }), Promise.resolve()) 
})


Deno.test("メソッド as_uri: パスを 'file:///'~ & posix 形式に変換", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
    const { posix, windows } = data
    if (label.includes("絶対") && !label.includes("ルートなし")){
      await t.step(`OK: ${label} は絶対パスなので実行`, () => {
        const actual = new PurePathLike(windows).as_uri()
        const expected = "file:///" + posix.replace("./", "")
        assertEquals(actual, expected)
      })
    } else {
      await t.step(`Fail-OK: ${label} は相対 / no-root なのでエラー`, () => {
        try {
          new PurePathLike(windows).as_uri()
          throw new Error("Not Error")
        } catch (error) {
          assertIsError<TypeError>( error, TypeError, "Must be an absolute path.")
        }
      })
    }
  }), Promise.resolve())
})


Deno.test("メソッド is_absolute: 絶対パスかどうか (≒ anchor があるかどうか) を boolean で返す", async (t) => {  
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
    const expected = label.includes("絶対") == true && label.includes("ルートなし") == false
    const text = `OK: ${label} は ${expected}`
    const { windows } = data
    await t.step(text, () => {
      assertEquals(new PurePathLike(windows).is_absolute(), expected)
    })
  }), Promise.resolve() )
})


Deno.test("メソッド is_relative_to: 入力パスがパスオブジェクトのパスと頭部分を共有しているかどうかを判定 ( = 入力パスの parts がパスオブジェクトの parts の先頭からの部分集合であるかどうか)", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
    const { windows, parent_path, parents_paths } = data
    if (parents_paths.length == 0){
      console.log(`${label} は no parent なのでスキップ`)
      return
    }
    else if (parents_paths.length < 3  && parents_paths[0] == parent_path){
      console.log(`${label} は parent が1つなのでスキップ`)
      return
    }
    const head_3part = windows.split("\\").slice(0,3).join("\\")
    const head_3part_with_typo = head_3part.slice(0,-1)

    const base = new PurePathLike(windows)
    // string で入力しても内部では PurePathLike のインスタンスに変換して処理されるので、入力タイプの違いはチェックしない
    await t.step(`OK: ${label} に対して ${head_3part} は true`, () => {
      assertEquals(base.is_relative_to(head_3part), true)
    })

    await t.step(`OK: ${label} に対して ${head_3part_with_typo} は false`, () => {
      assertEquals(base.is_relative_to(head_3part_with_typo), false)
    })

    await t.step(`OK: ${label} に対して Users\\piyo は false`, () => {
      assertEquals(base.is_relative_to("Users\\piyo"), false)
    })
  }), Promise.resolve())
})


Deno.test("メソッド joinpath: 入力した string や パスオブジェクトのパスを結合した新しいパスオブジェクトを返す", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
      const { windows, parts } = data
      if (parts.length == 1){
        console.log(`スキップ：${label} は parts が1個`)
        return
      }
      const base = new PurePathLike(windows)
      await t.step(`OK: ${label} のパス = その parts を string として入力したときのパス`, () => {
        assertEquals(base.path, new PurePathLike(...parts).path)
      })

      await t.step(`OK: ${label} のパス ≠ その parts を 1個省いて string として入力したときのパス`, () => {
        assertNotEquals(base.path, new PurePathLike(...parts.slice(0,-1)).path)
      })

      await t.step(`OK: ${label} のパス = その parts を パスオブジェクト として入力したときのパス`, () => {
        assertEquals(base.path, new PurePathLike(...parts.map(tx => new PurePathLike(tx))).path)
      })
    }), Promise.resolve()
  )
})


Deno.test("メソッド match: (win表現の)正規表現がマッチするかどうかを返す (glob はよくわからないので省略)", async (t) => {
  const base = new PurePathLike(PathData.get("絶対")!.windows)
  const path_reg = /Windows\\Shell/
  const name_reg = /Default.+\.gz/

  await t.step(`OK: ${base.path} に正規表現 ${path_reg} がマッチする`, () => assertEquals(base.match(path_reg), true))
  
  await t.step(`OK: ${base.path} に正規表現 ${name_reg} がマッチする`, () => assertEquals(base.match(name_reg), true))
})


Deno.test("メソッド relative_to: 入力パスがパスオブジェクトのパスと頭部分を共有しているならそれより下部のパスから新しいパスオブジェクトを作成して返す", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
    const { windows, parent_path, parents_paths } = data
      if (parents_paths.length == 0){
        console.log(`${label} は no parent なのでスキップ`)
        return
      }
      else if (parents_paths.length < 3  && parents_paths[0] == parent_path){
        console.log(`${label} は parent が ${parents_paths.length}個なのでスキップ`)
        return
      }
      else {
        const head_3part = windows.split("\\").slice(0,3).join("\\")
        const head_3part_with_typo = head_3part.slice(0,-1)
        const expected = windows.split("\\").slice(3).join("\\")
        const base = new PurePathLike(windows)

        await t.step(`OK: ${label} を ${head_3part} の相対パス化したものが ${expected} に等しい`, () => {
          assertEquals(base.relative_to(head_3part).path, expected)
        })
        
        await t.step(`Fail-OK: ${label} の ${head_3part_with_typo} による相対パス化は不一致によってエラー`, () => {
          try {
            base.relative_to(head_3part_with_typo)
            throw new Error("No Error")
          } catch (error) {
            assertIsError(error, Error, "is not in the subpath of")
          }
        })        
      }
    }), Promise.resolve()
  )

  const { windows:abs_win } = PathData.get("絶対")!
  const { windows:rel_win } = PathData.get("相対")!
  await t.step(`Fail-OK: 適用対象とインプットの絶対--相対が不一致の場合はエラー`, () => {
    try {
      new PurePathLike(abs_win).relative_to(rel_win)
      throw new Error("No Error")
    } catch (error) {
      assertIsError(error, Error, "One path is relative and the other absolute.")
    }
  })
})


Deno.test("メソッド with_name: name を差し替えたパスによるパスオブジェクトを返す", async (t) => {
  const new_name = "new_name.txt"
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
      const { windows } = data
      const base = new PurePathLike(windows)
      const expected = [...windows.split("\\").slice(0,-1), new_name].join("\\")
          .replace("./", "").replace(".\\", "")

      const TEST = (label.includes("アンカーのみ") || label.includes("ドライブのみ"))
          ? {
            text: `Fail-OK: ${label} は no-name なのでエラー`,
            func: () => {
              try {
                base.with_name(new_name)
                throw new Error("No Error")
              } catch (error) {
                assertIsError(error, Error, "Cannot replace when original path's name is empty")
              }
            }
          }
          : {
            text: `OK: ${label} の name を ${new_name} に差し替えたパスが${expected} に一致`,
            func: () => {
              assertEquals(base.with_name(new_name).path, expected)
            }
          }
      await t.step(TEST.text, TEST.func) 
    }),Promise.resolve()
  )
})


Deno.test("メソッド with_stem: stem を差し替えたパスによるパスオブジェクトを返す", async (t) => {
  const new_stem = "new_stem"
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
      const { windows, suffix } = data
      const base = new PurePathLike(windows)
      const expected = [...windows.split("\\").slice(0,-1), new_stem+suffix].join("\\")
          .replace("./", "").replace(".\\", "")

      const TEST = (label.includes("アンカーのみ") || label.includes("ドライブのみ"))
          ? {
            text: `Fail-OK: ${label} は no-stem なのでエラー`,
            func: () => {
              try {
                base.with_stem(new_stem)
                throw new Error("No Error")
              } catch (error) {
                assertIsError(error, Error, "Cannot replace when original path's stem is empty")
              }
            }
          }
          : {
            text: `OK: ${label} の stem を ${new_stem} に差し替えたものが ${expected} に一致`,
            func: () => {
              assertEquals(base.with_stem(new_stem).path, expected)
            }
          }
      await t.step(TEST.text, TEST.func) 
    }),Promise.resolve()
  )
})


Deno.test("メソッド with_suffix: suffix を差し替えたパスによるパスオブジェクトを返す", async (t) => {
  const new_suffix = ".jpeg"
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
      const { windows, stem } = data
      const base = new PurePathLike(windows)
      const expected = [...windows.split("\\").slice(0,-1), stem+new_suffix].join("\\")
          .replace("./", "").replace(".\\", "")

      const TEST = (label.includes("アンカーのみ") || label.includes("ドライブのみ"))
          ? {
            text: `Fail-OK: ${label} は no-name なのでエラー`,
            func: () => {
              try {
                base.with_suffix(new_suffix)
                throw new Error("No Error")
              } catch (error) {
                assertIsError(error, Error, "Cannot replace when original path's name is empty")
              }
            }
          }
          : {
            text: `OK: ${label} の suffix を ${new_suffix} に差し替えたパスが ${expected} に一致`,
            func: () => {
              assertEquals(base.with_suffix(new_suffix).path, expected)
            }
          }
      await t.step(TEST.text, TEST.func) 
    }),Promise.resolve()
  )
})


// -------------- PathLike ---------------------
Deno.test("メソッド cwd: カレントディレクトリのパスオブジェクトを返す", () => {
  const actual = new PathLike().cwd().path
  const expected = Deno.cwd()
  assertEquals(actual, expected)
})


Deno.test("メソッド is_dir: ディレクトリかどうかを判定", async t => {
  const base_dir = new PathLike("test_data", "data_1")
  const dir_p = new PathLike(base_dir, "data_1_1")
  const dir_link_p = new PathLike(base_dir, "data_1_1_link")
  const file_p = new PathLike(base_dir, "text_1.txt")
  const file_link_p = new PathLike(base_dir, "text_1_link.txt")

  await [{p:dir_p, b:true}, {p:dir_link_p, b:false}, {p:file_p, b:false}, {p:file_link_p, b:false}]
    .reduce((pre, {p, b}) => pre.then(async () => {
        await t.step(`OK: ${p.name} では is_dir = ${b}`, () => {
          assertEquals(p.is_dir(), b)
        })
    }), Promise.resolve()
  )
})


Deno.test("メソッド is_file: ファイルかどうかを判定", async t => {
  const base_dir = new PathLike("test_data", "data_1")
  const dir_p = new PathLike(base_dir, "data_1_1")
  const dir_link_p = new PathLike(base_dir, "data_1_1_link")
  const file_p = new PathLike(base_dir, "text_1.txt")
  const file_link_p = new PathLike(base_dir, "text_1_link.txt")

  await [{p:dir_p, b:false}, {p:dir_link_p, b:false}, {p:file_p, b:true}, {p:file_link_p, b:false}]
    .reduce((pre, {p, b}) => pre.then(async () => {
        await t.step(`OK: ${p.name} では is_file = ${b}`, () => {
          assertEquals(p.is_file(), b)
        })
    }), Promise.resolve()
  )
})


Deno.test("メソッド is_symlink: シンボリックリンクかどうかを判定", async t => {
  const base_dir = new PathLike("test_data", "data_1")
  const dir_p = new PathLike(base_dir, "data_1_1")
  const dir_link_p = new PathLike(base_dir, "data_1_1_link")
  const file_p = new PathLike(base_dir, "text_1.txt")
  const file_link_p = new PathLike(base_dir, "text_1_link.txt")

  await [{p:dir_p, b:false}, {p:dir_link_p, b:true}, {p:file_p, b:false}, {p:file_link_p, b:true}]
    .reduce((pre, {p, b}) => pre.then(async () => {
        await t.step(`OK: ${p.name} では is_symlink = ${b}`, () => {
          assertEquals(p.is_symlink(), b)
        })
    }), Promise.resolve()
  )
})


Deno.test("メソッド iterdir: DenoFS.walk(this.path, {maxDepth: 1, ...options}) を返す", async () => {
  const p = new PathLike("test_data", "data_1")
  const actual:Array<string> = []
  const expected:Array<string> = []
  for await (const val of Deno.readDir(p.path)){
    actual.push(val.name)
  }
  for await (const val of p.iterdir()){
    expected.push(val.name)
  }
  assertEquals(actual, expected)
})


Deno.test("メソッド iterdirMap: iterdir() の返り値に対して .map() のように非同期処理を適用する", async () => {
  const p = new PathLike("test_data", "data_1")
  const expected = [
    "data_1_1", , "before.txt", "euc-jp.txt", "data_1_1_link",
    "sample", "shift_jis.txt", "text_1.txt", "text_1_link.txt"
  ].sort()
  const actual = await p.iterdirMap(async p => await Promise.resolve().then(() => p.name))
      .then(lis => lis.sort())
  assertEquals(actual, expected)
})



Deno.test("メソッド iterdirMapSync: iterdir() の返り値に対して .map() のように同期処理を適用する", async () => {
  const p = new PathLike("test_data", "data_1")
  const expected = [
    "data_1_1", , "before.txt", "euc-jp.txt", "data_1_1_link",
    "sample", "shift_jis.txt", "text_1.txt",  "text_1_link.txt"
  ].sort()
  const actual = await p.iterdirMapSync( p =>  p.name).then(lis => lis.sort())
  assertEquals(actual, expected)
})


Deno.test("メソッド mkdir: 指定したパスにディレクトリ作成", async t => {
  const test_dir = new PathLike("test_data")
  const direct_child = new PathLike(test_dir, "child_dir")
  const nested_child = new PathLike(test_dir, "nest", "child_dir")

  await t.step(`OK: 直下にディレクトリを作成`, async () => {
    await direct_child.mkdir()
    const iter = Deno.readDir(direct_child.path)
    assertExists(iter)
    await Deno.remove(direct_child.path)
  })

  await t.step(`Fail-OK: 経路に存在しないディレクトリがある場合はエラー`, async () => {
    try {
      await nested_child.mkdir() 
    } catch (error) {
     assertIsError(error, Error, "指定されたパスが見つかりません。")
    }
  })

  await t.step(`OK: 経路に存在しないディレクトリがある場合に {parents:true} オプションを与えると成功`, async () => {
    await nested_child.mkdir({parents: true})
    const iter = Deno.readDir(nested_child.path)
    assertExists(iter)
    await Deno.remove(nested_child.path, {recursive:true})
  })
})


Deno.test("メソッド open: ファイルを開いて Deno.FsFile を返す", async t => {
  const text_path = new PathLike("test_data", "data_1", "before.txt")
  const not_exist_path = new PathLike("test_data", "data_1", "text_99.txt")

  await (["w", "r", "a"] as const).reduce( (pre, mode) => pre.then(async () => {
    await t.step(`OK: mode ${mode} で開く`, async () => {
      const file = await text_path.open({mode})
      assertExists(file)
      file.close()
    })
  }) , Promise.resolve())

  await t.step(`OK: {truncate: true} で開く`, async () => {
    const file = await text_path.open({mode:"w", truncate:true})
    assertExists(file)
    file.close()
  })
  
  await t.step(`Fail-OK: mode "x" ですでに存在するファイルを開くとエラー`, async () => {
    try {
      const file = await text_path.open({mode: "x"})
      file.close()
    } catch (error) {
      assertIsError(error, Error, "already exists.")
    }
  })

  let is_x2__OK = await t.step(`OK: mode "x" で存在しないファイルを指定すると作成してそれを開く`, async () => {
    const file = await not_exist_path.open({mode: "x"})
    assertExists(file)
    file.close()
    await Deno.remove(not_exist_path.path)
  })
  if (is_x2__OK == false){
    console.log(`text_99.txt が削除されていない可能性があるので停止`)
    return
  }

  is_x2__OK = await t.step(`OK: {create: true} のときは存在しない text_99.txt を作成して開く`, async () => {
    const file = await not_exist_path.open({create: true})
    assertExists(file)
    file.close()
    await Deno.remove(not_exist_path.path)
  })
  if (is_x2__OK == false){
    console.log(`text_99.txt が削除されていない可能性があるので停止`)
    return
  }

  is_x2__OK = await t.step(`OK: {createNew: true} のときは存在しない text_99.txt を作成して開く`, async () => {
    const file = await not_exist_path.open({createNew: true})
    assertExists(file)
    file.close()
    await Deno.remove(not_exist_path.path)
  })
  if (is_x2__OK == false){
    console.log(`text_99.txt が削除されていない可能性があるので停止`)
    return
  }

  await t.step(`Fail-OK: {createNew: true} ですでに存在する text_1.txt を開くとエラー`, async () => {
    try {
      const file = await text_path.open({createNew: true})
      file.close()
    } catch (error) {
      assertIsError(error, Error, "ファイルがあります")
    }
  })
})


Deno.test("メソッド openSync: ファイルを開いて Deno.FsFile を返す", async t => {
  const text_path = new PathLike("test_data", "data_1", "before.txt")
  const not_exist_path = new PathLike("test_data", "data_1", "text_99.txt")

  await (["w", "r", "a"] as const).reduce( (pre, mode) => pre.then(async () => {
    await t.step(`OK: mode ${mode} でファイルを開いてを開く`,  () => {
      const file = text_path.openSync({mode})
      assertExists(file)
      file.close()
    })
  }) , Promise.resolve())

  await t.step(`OK: {truncate: true} でファイルを開く`, () => {
    const file = text_path.openSync({mode:"w", truncate:true})
    assertExists(file)
    file.close()
  })
  
  await t.step(`Fail-OK: mode "x" ですでに存在するファイルを開くとエラー`,  () => {
    try {
      const file = text_path.openSync({mode: "x"})
      file.close()
    } catch (error) {
      assertIsError(error, Error, "already exists.")
    }
  })
  let is_x2__OK = await t.step(`OK: mode "x" で存在しないファイルを指定すると作成してそれを開く`, async () => {
    const file = not_exist_path.openSync({mode: "x"})
    assertExists(file)
    file.close()
    await Deno.remove(not_exist_path.path)
  })
  if (is_x2__OK == false){
    console.log(`text_99.txt が削除されていない可能性があるので停止`)
    return
  }

  is_x2__OK = await t.step(`OK: {create: true} のときは存在しないファイルを作成して開く`, async () => {
    const file = not_exist_path.openSync({create: true})
    assertExists(file)
    file.close()
    await Deno.remove(not_exist_path.path)
  })
  if (is_x2__OK == false){
    console.log(`text_99.txt が削除されていない可能性があるので停止`)
    return
  }

  is_x2__OK = await t.step(`OK: {createNew: true} のときは存在しないファイルを作成して開く`, async () => {
    const file = not_exist_path.openSync({createNew: true})
    assertExists(file)
    file.close()
    await Deno.remove(not_exist_path.path)
  })
  if (is_x2__OK == false){
    console.log(`text_99.txt が削除されていない可能性があるので停止`)
    return
  }

  await t.step(`Fail-OK: {createNew: true} ですでに存在するファイルを開くとエラー`, () => {
    try {
      const file = text_path.openSync({createNew: true})
      file.close()
    } catch (error) {
      assertIsError(error, Error, "ファイルがあります")
    }
  })
})


Deno.test("メソッド read_byte: バイナリファイルとして読み込む", async () => {
  const expected = new Uint8Array([100, 101, 110, 111, 95, 112,  97, 116, 104, 108, 105,  98])
  const actual = await new PathLike("test_data", "data_1", "sample").read_bytes()
  assertEquals(actual, expected)
})


Deno.test("メソッド read_byteSync: バイナリファイルとして読み込む", () => {
  const expected = new Uint8Array([100, 101, 110, 111, 95, 112,  97, 116, 104, 108, 105,  98])
  const actual = new PathLike("test_data", "data_1", "sample").read_bytesSync()
  assertEquals(actual, expected)
})


Deno.test("メソッド read_text: テキストファイルとして読み込む", async t => {
  const utf_8 = new PathLike("test_data", "data_1", "text_1.txt")
  const shift_jis = new PathLike("test_data", "data_1", "shift_jis.txt")
  const euc_jp = new PathLike("test_data", "data_1", "euc-jp.txt")
  const expected = "pathlib っぽい挙動をするモジュール"

  await t.step(`OK: 何も指定しない場合は utf-8 で読み込む`, async () => {
    const actual = await utf_8.read_text()
    assertEquals(actual, expected)
  })

  await t.step(`OK: shift_jis で読み込む`, async () => {
    const actual = await shift_jis.read_text("shift_jis")
    assertEquals(actual, expected)
  })

  await t.step(`OK: euc-jp で読み込む`, async () => {
    const actual = await euc_jp.read_text("euc-jp")
    assertEquals(actual, expected)
  })
})


Deno.test("メソッド read_textSync: テキストファイルとして読み込む", async t => {
  const utf_8 = new PathLike("test_data", "data_1", "text_1.txt")
  const shift_jis = new PathLike("test_data", "data_1", "shift_jis.txt")
  const euc_jp = new PathLike("test_data", "data_1", "euc-jp.txt")
  const expected = "pathlib っぽい挙動をするモジュール"

  await t.step(`OK: 何も指定しない場合は utf-8 で読み込む`, () => {
    const actual = utf_8.read_textSync()
    assertEquals(actual, expected)
  })

  await t.step(`OK: shift_jis で読み込む`,  () => {
    const actual = shift_jis.read_textSync("shift_jis")
    assertEquals(actual, expected)
  })

  await t.step(`OK: euc-jp で読み込む`,  () => {
    const actual = euc_jp.read_textSync("euc-jp")
    assertEquals(actual, expected)
  })
})


Deno.test("メソッド read_link: シンボリックリンクの指すパスを返す", async () => {
  const actual = await new PathLike("test_data", "data_1", "text_1_link.txt").readlink()
  assertEquals(actual, "text_1.txt")
})


Deno.test("メソッド rename: リネームして新しいパスのパスオブジェクトを返す", async t => {
  const before = new PathLike("test_data", "data_1", "before.txt")
  const after = new PathLike("test_data", "data_1", "after.txt")

  await t.step(`OK: リネームする`, async () => {
    const renamed = await before.rename(after)
    assertEquals(renamed.path, after.path)
    await renamed.rename(before)
  })

  await t.step(`Fail-OK: リネーム先のパスがすでに存在する場合はエラーを出す`, async () => {
    try {
      await before.rename("test_data", "data_1", "text_1.txt")
    } catch (error) {
      assertIsError(error, Error, "already exists.")
    }
  })
})


Deno.test("メソッド resolve: 絶対パスを返す", async t => {
  const base_dir = new PathLike(Deno.env.get("gitPath")!, "deno_pathlib")
  const file = new PathLike("test_data", "data_1", "text_1.txt")
  const abs = new PathLike(base_dir, file)

  await t.step(`OK: 相対から絶対パスを解決`, () => {
    assertEquals(file.resolve(), abs.path)
  })

  await t.step(`Fail-OK: 存在しないパスを解決しようとするとエラー`, () => {
    const not_exists = new PathLike("test_data", "data_99")
    try {
      not_exists.resolve()
    } catch (error) {
      assertIsError(error, Error, "指定されたファイルが見つかりません")
    }
  })
})

/* windows でシンボリックリンク作成を行うには、管理者で cmd を立ち上げる必要がある

Deno.test("メソッド symlink: 現在のパスに指定したパスへのシンボリックリンクを作成する", async t => {
  const link_file_p = new PathLike("test_data", "data_1", "readme_link.txt")
  const link_to_file = new PathLike("README.txt")
  const link_dir_p = new PathLike("test_data", "data_1", "data_2_2_link")
  const link_to_dir = new PathLike("test_data", "data_2", "data_2_2")

  await t.step(`OK: {type: "file"} を指定してファイルへのシンボリックリンクを作成する`, async () => {
    try {
      await link_file_p.symlink(link_to_file, "file")
      await link_file_p.remove()
      throw new Error("Not Error")
    } catch (error) {
      assertIsError(error, Error, "Not Error")
    }
  })

  await t.step(`OK: {type: "dir"} を指定してディレクトリへのシンボリックリンクを作成する`, async () => {
    try {
      await link_dir_p.symlink(link_to_dir, "dir")
      await link_dir_p.remove()
      throw new Error("Not Error")
    } catch (error) {
      assertIsError(error, Error, "Not Error")
    }
  })
})


Deno.test("メソッド symlinkSync: 現在のパスに指定したパスへのシンボリックリンクを作成する", async t => {
  const link_file_p = new PathLike("test_data", "data_1", "readme_link.txt")
  const link_to_file = new PathLike("README.txt")
  const link_dir_p = new PathLike("test_data", "data_1", "data_2_2_link")
  const link_to_dir = new PathLike("test_data", "data_2", "data_2_2")

  await t.step(`OK: {type: "file"} を指定してファイルへのシンボリックリンクを作成する`, () => {
    try {
      link_file_p.symlinkSync(link_to_file, "file")
      link_file_p.removeSync()
      throw new Error("Not Error")
    } catch (error) {
      assertIsError(error, Error, "Not Error")
    }
  })

  await t.step(`OK: {type: "dir"} を指定してディレクトリへのシンボリックリンクを作成する`, () => {
    try {
      link_dir_p.symlinkSync(link_to_dir, "dir")
      link_dir_p.removeSync()
      throw new Error("Not Error")
    } catch (error) {
      assertIsError(error, Error, "Not Error")
    }
  })
})
*/


Deno.test("メソッド touch: 現在のパスに空ファイルを作成する", async t => {
  const to_touch = new PathLike("test_data", "data_1", "touched.txt")

  await t.step(`OK: ファイル作成`, async () => {
    try {
      await to_touch.touch()
      await to_touch.remove()
      throw new Error("Not Error")
    } catch (error) {
      assertIsError(error, Error, "Not Error")
    }
  })

  await t.step(`OK: exist_ok を指定しない場合、すでにファイルが存在していれば何もしない`, async () => {
    try {
      await to_touch.touch()
      await to_touch.touch()
      await to_touch.remove()
      throw new Error("Not Error")
    } catch (error) {
      assertIsError(error, Error, "Not Error")
    }
  })

  await t.step(`Fail-OK: exist_ok = false の場合、すでにファイルが存在していればエラー`, async () => {
    try {
      await to_touch.touch()
      await to_touch.touch({exist_ok:false})
    } catch (error) {
      assertIsError(error, Error, "already exists.")
      await to_touch.remove()
    }
  })
})


Deno.test("メソッド touchSync: 現在のパスに空ファイルを作成する", async t => {
  const to_touch = new PathLike("test_data", "data_1", "touched.txt")

  await t.step(`OK: ファイル作成`, () => {
    try {
      to_touch.touchSync()
      to_touch.removeSync()
      throw new Error("Not Error")
    } catch (error) {
      assertIsError(error, Error, "Not Error")
    }
  })

  await t.step(`OK: exist_ok を指定しない場合、すでにファイルが存在していれば何もしない`, () => {
    try {
      to_touch.touchSync()
      to_touch.touchSync()
      to_touch.removeSync()
      throw new Error("Not Error")
    } catch (error) {
      assertIsError(error, Error, "Not Error")
    }
  })

  await t.step(`Fail-OK: exist_ok = false の場合、すでにファイルが存在していればエラー`, () => {
    try {
      to_touch.touchSync()
      to_touch.touchSync({exist_ok:false})
    } catch (error) {
      assertIsError(error, Error, "already exists.")
      to_touch.removeSync()
    }
  })
})


Deno.test("メソッド write_byte: バイナリデータをファイルに書き込む", async t => {
  const expected = new Uint8Array([100, 101, 110, 111, 95, 112,  97, 116, 104, 108, 105,  98])
  const to_create = new PathLike("test_data", "data_1", "created")

  await t.step(`OK: 存在しない場合はファイルを作成`, async () => {
    await to_create.write_bytes(expected)
    const actual = await to_create.read_bytes()
    assertEquals(actual, expected)
    await to_create.remove()
  })

  await t.step(`Fail-OK: create = false の場合は存在しないファイルならエラー`, async () => {
    try {
      await to_create.write_bytes(expected, {create:false})  
    } catch (error) {
      assertIsError(error, Error, "指定されたファイルが見つかりません")
    }
  })
  
  await t.step(`OK: mode = "a" の場合は既存ファイルに内容を追加`, async () => {
    await to_create.write_bytes(expected.slice(0, 7))
    await to_create.write_bytes(expected.slice(7), {mode:"a"})
    const actual = await to_create.read_bytes()
    assertEquals(actual, expected)
    await to_create.remove()
  })
  
  await t.step(`Fail-OK: mode = "x" で既存ファイルにアクセスした場合はエラー`, async () => {
    await to_create.write_bytes(expected.slice(0, 7))
    try {
      await to_create.write_bytes(expected.slice(7), {mode:"x"})
    } catch (error) {
      assertIsError(error, Error, "already exists.")
      await to_create.remove()
    }
  })
})


Deno.test("メソッド write_byteSync: バイナリデータをファイルに書き込む", async t => {
  const expected = new Uint8Array([100, 101, 110, 111, 95, 112,  97, 116, 104, 108, 105,  98])
  const to_create = new PathLike("test_data", "data_1", "created")

  await t.step(`OK: 存在しない場合はファイルを作成`, () => {
    to_create.write_bytesSync(expected)
    const actual = to_create.read_bytesSync()
    assertEquals(actual, expected)
    to_create.removeSync()
  })

  await t.step(`Fail-OK: create = false の場合は存在しないファイルならエラー`, () => {
    try {
      to_create.write_bytesSync(expected, {create:false})  
    } catch (error) {
      assertIsError(error, Error, "指定されたファイルが見つかりません")
    }
  })
  
  await t.step(`OK: mode = "a" の場合は既存ファイルに内容を追加`, () => {
    to_create.write_bytesSync(expected.slice(0, 7))
    to_create.write_bytesSync(expected.slice(7), {mode:"a"})
    const actual = to_create.read_bytesSync()
    assertEquals(actual, expected)
    to_create.removeSync()
  })
  
  await t.step(`Fail-OK: mode = "x" で既存ファイルにアクセスした場合はエラー`, () => {
    to_create.write_bytesSync(expected.slice(0, 7))
    try {
      to_create.write_bytesSync(expected.slice(7), {mode:"x"})
    } catch (error) {
      assertIsError(error, Error, "already exists.")
      to_create.removeSync()
    }
  })
})


Deno.test("メソッド write_text: テキストをファイルに書き込む", async t => {
  const to_create = new PathLike("test_data", "data_1", "created.txt")
  const expected = "pathlib っぽい挙動をするモジュール"

  await t.step(`OK: 存在しない場合はファイルを作成`, async () => {
    await to_create.write_text(expected)
    const actual = await to_create.read_text()
    assertEquals(actual, expected)
    await to_create.remove()
  })

  await t.step(`Fail-OK: create = false の場合は存在しないファイルならエラー`, async () => {
    try {
      await to_create.write_text(expected, {create:false})  
    } catch (error) {
      assertIsError(error, Error, "指定されたファイルが見つかりません")
    }
  })
  
  await t.step(`OK: mode = "a" の場合は既存ファイルに内容を追加`, async () => {
    await to_create.write_text(expected.slice(0, 7))
    await to_create.write_text(expected.slice(7), {mode:"a"})
    const actual = await to_create.read_text()
    assertEquals(actual, expected)
    await to_create.remove()
  })
  
  await t.step(`Fail-OK: mode = "x" で既存ファイルにアクセスした場合はエラー`, async () => {
    await to_create.write_text(expected.slice(0, 7))
    try {
      await to_create.write_text(expected.slice(7), {mode:"x"})
    } catch (error) {
      assertIsError(error, Error, "already exists.")
      await to_create.remove()
    }
  })
})


Deno.test("メソッド write_textSync: テキストをファイルに書き込む", async t => {
  const to_create = new PathLike("test_data", "data_1", "created.txt")
  const expected = "pathlib っぽい挙動をするモジュール"

  await t.step(`OK: 存在しない場合はファイルを作成`, () => {
     to_create.write_textSync(expected)
    const actual =  to_create.read_textSync()
    assertEquals(actual, expected)
    to_create.removeSync()
  })

  await t.step(`Fail-OK: create = false の場合は存在しないファイルならエラー`, () => {
    try {
      to_create.write_textSync(expected, {create:false})  
    } catch (error) {
      assertIsError(error, Error, "指定されたファイルが見つかりません")
    }
  })
  
  await t.step(`OK: mode = "a" の場合は既存ファイルに内容を追加`, () => {
    to_create.write_textSync(expected.slice(0, 7))
    to_create.write_textSync(expected.slice(7), {mode:"a"})
    const actual = to_create.read_textSync()
    assertEquals(actual, expected)
    to_create.remove()
  })
  
  await t.step(`Fail-OK: mode = "x" で既存ファイルにアクセスした場合はエラー`, () => {
    to_create.write_textSync(expected.slice(0, 7))
    try {
      to_create.write_textSync(expected.slice(7), {mode:"x"})
    } catch (error) {
      assertIsError(error, Error, "already exists.")
      to_create.removeSync()
    }
  })
})