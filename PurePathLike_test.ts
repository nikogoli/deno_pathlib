import { assertEquals, assertIsError, assertNotEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts"

import { PurePathLike } from "./PurePathLike.ts"

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
  assertEquals(A.parent.path, B.parent.path)
}

// ----------- construct ---------------
Deno.test("作成：空入力はエラー", () => {
  try {
    new PurePathLike()
    throw new Error("Not Error")
  } catch (error) {
    assertIsError(error, Error, "At least one input is needed") 
  }
})


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
        assertEquals(base_by_win.parent.path, parent_path)
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