import { assertEquals, assertIsError, assertNotEquals, assertExists, assertInstanceOf  } from "https://deno.land/std@0.170.0/testing/asserts.ts"

import { PathLike, r } from "./PathLike.ts"


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


function same_check(A:PathLike, B:PathLike){
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
    new PathLike()
    throw new Error("Not Error")
  } catch (error) {
    assertIsError(error, Error, "At least one input is needed") 
  }
})
*/

Deno.test("関数 r: String.raw を用いてテンプレートリテラルを raw 文字列として処理する", async t => {
  await t.step("エスケープなし文字列 + r による PathLike がエスケープあり文字列による PathLike と等しい", () => {
    assertEquals(
      new PathLike(r`C:\Users\Default\AppData\Local\Microsoft\Windows\Shell\DefaultLayouts.tar.gz`).path,
      new PathLike("C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz").path
    )
  })
})

// ------------- single input  --------------------
Deno.test("単一パス入力 → attr", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
    await t.step(`check ${label}`, async (_tt) => {
      const {
        posix, windows, drive, root, anchor, name, stem, suffix, suffixes, parts,
        parents_paths, parent_path } = data
      const base_by_win = new PathLike(windows)
      const base_by_posix = new PathLike(posix)

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


Deno.test("エラーになる入力", async t => {
  await t.step("Fail-OK: 複数の入力の中に undefined が含まれるときはエラー", () => {
    try {
      new PathLike(Deno.env.get("NotExisted")!, "data")
    } catch (error) {
      assertIsError(error, Error, "undefined / null")
    }
  })

  await t.step("Fail-OK: 複数の入力の中に null が含まれるときはエラー", () => {
    try {
      new PathLike(null as unknown as string, "data")
    } catch (error) {
      assertIsError(error, Error, "undefined / null")
    }
  })

  await t.step("OK: 空入力はエラーにしない", () => {
    try {
      new PathLike()
      throw new Error("Not Error!")
    } catch (error) {
      assertIsError(error, Error, "Not Error!")
    }
  })

})

// 複合インプットは .joinpath() メソッドと実質的に同じなので省略

// ---------- methods ----------------------
Deno.test("メソッド as_posix: 区切り文字を '\\' から '/' に変換 (パス頭の './' は削除)", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
    const { posix, windows } = data
    const actual = new PathLike(windows).as_posix()
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
        const actual = new PathLike(windows).as_uri()
        const expected = "file:///" + posix.replace("./", "")
        assertEquals(actual, expected)
      })
    } else {
      await t.step(`Fail-OK: ${label} は相対 / no-root なのでエラー`, () => {
        try {
          new PathLike(windows).as_uri()
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
      assertEquals(new PathLike(windows).is_absolute(), expected)
    })
  }), Promise.resolve() )
})


Deno.test("メソッド joinpath: 入力した string や パスオブジェクトのパスを結合した新しいパスオブジェクトを返す", async (t) => {
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
      const { windows, parts } = data
      if (parts.length == 1){
        console.log(`スキップ：${label} は parts が1個`)
        return
      }
      const base = new PathLike(windows)
      await t.step(`OK: ${label} のパス = その parts を string として入力したときのパス`, () => {
        assertEquals(base.path, new PathLike(...parts).path)
      })

      await t.step(`OK: ${label} のパス ≠ その parts を 1個省いて string として入力したときのパス`, () => {
        assertNotEquals(base.path, new PathLike(...parts.slice(0,-1)).path)
      })

      await t.step(`OK: ${label} のパス = その parts を パスオブジェクト として入力したときのパス`, () => {
        assertEquals(base.path, new PathLike(...parts.map(tx => new PathLike(tx))).path)
      })
    }), Promise.resolve()
  )
})


Deno.test("メソッド match: (win表現の)正規表現がマッチするかどうかを返す (glob はよくわからないので省略)", async (t) => {
  const base = new PathLike(PathData.get("絶対")!.windows)
  const path_reg = /Windows\\Shell/
  const name_reg = /Default.+\.gz/

  await t.step(`OK: ${base.path} に正規表現 ${path_reg} がマッチする`, () => assertEquals(base.match(path_reg), true))
  
  await t.step(`OK: ${base.path} に正規表現 ${name_reg} がマッチする`, () => assertEquals(base.match(name_reg), true))
})


Deno.test("メソッド with_name: name を差し替えたパスによるパスオブジェクトを返す", async (t) => {
  const new_name = "new_name.txt"
  await [...PathData.entries()].reduce( (pre, [label, data]) => pre.then( async () => {
      const { windows } = data
      const base = new PathLike(windows)
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
      const base = new PathLike(windows)
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
      const base = new PathLike(windows)
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
Deno.test("メソッド copy: ファイル/ディレクトリをコピーしてコピー後の PathLike を返す", async t => {
  await t.step("OK: ファイルをコピー", async () => {
    const base_p = new PathLike("test_data", "data_1", "text_1.txt")
    const expected = await base_p.read_text()
    const target = new PathLike("test_data", "copied.txt")
    const copied = await base_p.copy(target)
    const actual = await copied.read_text()
    assertEquals(actual, expected)
    await copied.remove()
  })

  await t.step("OK: ディレクトリを中身ごとコピーしてコピー後の PathLike を返す", async () => {
    const base_p = new PathLike("test_data", "data_2")
    const expteced = await base_p.iterdirMap(p => p.name).then(lis => lis.sort().join(", "))
    const target = new PathLike("test_data", "copied_dir")
    const copied = await base_p.copy(target)
    const actual = await copied.iterdirMap(p => p.name).then(lis => lis.sort().join(", "))
    assertEquals(actual, expteced)
    await copied.remove({removeNonEmptyDir:true})
  })
})


Deno.test("メソッド copyInto: ファイル/ディレクトリを指定ディレクトリ直下にコピーしてコピー後の PathLike を返す", async t => {
  await t.step("OK: ファイルをコピー", async () => {
    const base_p = new PathLike("test_data", "data_1", "text_1.txt")
    const expected = await base_p.read_text()
    const dest_dir_p = new PathLike("test_data")
    const copied = await base_p.copyInto(dest_dir_p)
    const actual = await copied.read_text()
    assertEquals(actual, expected)
    await copied.remove()
  })

  await t.step("OK: ディレクトリを中身ごとコピーしてコピー後の PathLike を返す", async () => {
    const base_p = new PathLike("test_data", "data_2")
    const expteced = await base_p.iterdirMap(p => p.name).then(lis => lis.sort().join(", "))
    const container = await new PathLike("test_data", "container").ensureDir()
    const copied = await base_p.copyInto(container)
    const actual = await copied.iterdirMap(p => p.name).then(lis => lis.sort().join(", "))
    assertEquals(actual, expteced)
    await container.remove({removeNonEmptyDir:true})
  })
})


Deno.test("メソッド cwd: カレントディレクトリのパスオブジェクトを返す", () => {
  const actual = new PathLike().cwd().path
  const expected = Deno.cwd()
  assertEquals(actual, expected)
})


Deno.test("メソッド ensureDir: DenoFS.ensureDir() を実行する", async t => {
  const fl_target = new PathLike("test_data", "data_3", "data_3_3", "temp.txt")
  const dir_target = fl_target.parent()

  await t.step("OK: ディレクトリの場合はそれ自体に ensureDir する", async () => {
    await dir_target.ensureDir()
    const is_exist = await dir_target.exists()
    assertNotEquals(is_exist, false)
    await new PathLike("test_data", "data_3").remove({removeNonEmptyDir:true})
  })

  await t.step("OK: is_file が true の場合はその親ディレクトリを ensureDir する", async () => {
    await fl_target.ensureDir({is_file: true})
    const par_dit = fl_target.parent()
    const is_exist = await par_dit.exists()
    assertNotEquals(is_exist, false)
    await new PathLike("test_data", "data_3").remove({removeNonEmptyDir:true})
  })
})


Deno.test("メソッド dirFiles: ディレクトリ内のファイルのパスオブジェクトの配列を返す", async t => {
  const data_dir = new PathLike("test_data", "data_1")

  await t.step("OK: パスオブジェクトの配列を得る", async () => {
    const files = await data_dir.dirFiles()
    assertNotEquals(files.length, 0)
    assertInstanceOf(files[0], PathLike)
  })

  await t.step("Fail-OK: ファイルがない場合は空の配列を返す", async () => {
    const files = await data_dir.joinpath("data_1_1").dirFiles()
    assertEquals(files.length, 0)
  })

  await t.step("Fail-OK: ファイルなどの無効なパスを指定するとエラー", async () => {
    try {
      await data_dir.joinpath("text_1.txt").dirFiles()
      throw new Error("Not Error!")  
    } catch (error) {
      assertIsError(error, Error, "ディレクトリ名が無効です。")
    }
  })
})


Deno.test("メソッド dirDirs: ディレクトリ内のディレクトリのパスオブジェクトの配列を返す", async t => {
  const data_dir = new PathLike("test_data", "data_1")

  await t.step("OK: パスオブジェクトの配列を得る", async () => {
    const files = await data_dir.dirDirs()
    assertNotEquals(files.length, 0)
    assertInstanceOf(files[0], PathLike)
  })

  await t.step("Fail-OK: ディレクトリがない場合は空の配列を返す", async () => {
    const files = await new PathLike("test_data", "data_1", "data_1_1").dirDirs()
    assertEquals(files.length, 0)
  })

  await t.step("Fail-OK: ファイルなどの無効なパスを指定するとエラー", async () => {
    try {
      await data_dir.joinpath("text_1.txt").dirDirs()
      throw new Error("Not Error!")  
    } catch (error) {
      assertIsError(error, Error, "ディレクトリ名が無効です。")
    }
  })
})


Deno.test("メソッド resolveRelative: PathLike を基準に相対パスを解決したPathLike を返す", async t => {
  const base_p_abs = new PathLike(Deno.cwd(), "test_data", "data_2", "text_2.txt")
  const base_p_rel = new PathLike("test_data", "data_2", "text_2.txt")
  const expected = new PathLike(Deno.cwd(), "test_data", "data_1", "text_1.txt").path

  await t.step("OK: 絶対パスのファイルの PathLike から相対パスを正しく解決する", () => {
    const actual = base_p_abs.resolveRelative("..", "data_1", "text_1.txt").path
    assertEquals(actual, expected)
  })

  await t.step("OK: 相対パスのファイルの PathLike から相対パスを正しく解決する", () => {
    const actual = base_p_rel.resolveRelative("..", "data_1", "text_1.txt").path
    assertEquals(actual, expected)
  })
  
  await t.step("OK: 絶対パスのディレクトリの PathLike から相対パスを正しく解決する", () => {
    const actual = base_p_abs.parent().resolveRelative("..", "data_1", "text_1.txt").path
    assertEquals(actual, expected)
  })

  await t.step("OK: 相対パスのディレクトリの PathLike から相対パスを正しく解決する", () => {
    const actual = base_p_rel.parent().resolveRelative("..", "data_1", "text_1.txt").path
    assertEquals(actual, expected)
  })

  await t.step("OK: 絶対パスの場合、結果はカレントディレクトリに依存しない", () => {
    const cwd = new PathLike().cwd()
    Deno.chdir(cwd.parent().path)
    const actual = base_p_abs.resolveRelative("..", "data_1", "text_1.txt").path
    assertEquals(actual, expected)
    Deno.chdir(cwd.path)
  })

  await t.step("Fail-OK: 相対パスの場合、結果および成否はカレントディレクトリに依存する", () => {
    const cwd = new PathLike().cwd()
    Deno.chdir(cwd.parent().path)
    try {
      const _actual = base_p_rel.resolveRelative("..", "data_1", "text_1.txt").path
    } catch (error) {
      assertIsError(error, Error, "指定されたパスが見つかりません。")
      Deno.chdir(cwd.path)
    }
  })
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


Deno.test("メソッド iterdirMap: iterdir() の返り値に対して Array.map() のような逐次処理を適用する", async t => {
  const p = new PathLike("test_data", "data_1")
  const expected = [
    "data_1_1", , "before.txt", "euc-jp.txt", "data_1_1_link",
    "sample", "shift_jis.txt", "text_1.txt", "text_1_link.txt", "object.json"
  ].sort()

  await t.step("OK: 非同期のコールバック", async () => {
    const actual = await p.iterdirMap(async p => await Promise.resolve().then(() => p.name))
    .then(lis => lis.sort())
    assertEquals(actual, expected)
  })

  await t.step("OK: 同期のコールバック", async () => {
    const actual = await p.iterdirMap( p =>  p.name).then(lis => lis.sort())
  assertEquals(actual, expected)
  })
})


Deno.test("メソッド iterdirFilter: iterdir() の返り値に対して Array.filter() のような処理を行う ", async t => {
  const dir_p = new PathLike("test_data", "data_1")
  
  await t.step("OK: true になるものがあればそれら PathLike を配列を返す", async () => {
    const found = await dir_p.iterdirFilter(p => p.name.startsWith("text"))
    assertEquals(found.length, 2)
    assertInstanceOf(found[0], PathLike)
  })

  await t.step("fail-OK: true になるパスがなければ 空の配列を返す", async ()=>{
    const found = await dir_p.iterdirFilter(p => p.name.startsWith("not_text"))
    assertEquals(found.length, 0)
  })

  await t.step("OK: ディレクトリとファイルの両方を対象にする", async () => {
    const found = await dir_p.iterdirFilter(p => p.name.includes("_1"))
    assertExists(found.find(p => p.is_dir()))
    assertExists(found.find(p => p.is_file()))
  })
})


Deno.test("メソッド iterdirFind: iterdir() の返り値に対して Array.find() のような処理を行う ", async t => {
  const dir_p = new PathLike("test_data", "data_1")
  
  await t.step("OK: [ファイル] true になるパスがあれば PathLike を返す", async () => {
    const found = await dir_p.iterdirFind((p:PathLike) => p.name == "text_1.txt")
    assertInstanceOf(found, PathLike)
  })

  await t.step("fail-OK: [ファイル] true になるパスがなければ undefined を返す", async ()=>{
    const found = await dir_p.iterdirFind((p:PathLike) => p.name == "text_99.txt")
    assertEquals(found, undefined)
  })

  await t.step("OK: [ディレクトリ] true になるパスがあれば PathLike を返す", async () => {
    const found = await dir_p.iterdirFind((p:PathLike) => p.name == "data_1_1", "dir")
    assertInstanceOf(found, PathLike)
  })

  await t.step("fail-OK: [ディレクトリ] true になるパスがなければ undefined を返す", async ()=>{
    const found = await dir_p.iterdirFind((p:PathLike) => p.name == "data_1_99", "dir")
    assertEquals(found, undefined)
  })

  await t.step("OK: [both] true になるパスがあれば PathLike を返す", async () => {
    const found = await dir_p.iterdirFind((p:PathLike) => ["data_1_1", "text_1.txt"].includes(p.name), "both")
    assertInstanceOf(found, PathLike)
  })

  await t.step("fail-OK: [both] true になるパスがなければ undefined を返す", async ()=>{
    const found = await dir_p.iterdirFind((p:PathLike) => ["data_1_99", "text_99.txt"].includes(p.name), "both")
    assertEquals(found, undefined)
  })

  await t.step("OK: 非同期関数を渡した場合も同様に機能する", async () => {
    const found = await dir_p.iterdirFind( async p => {
      if (p.suffix != ".txt"){ return false }
      const tx = await p.read_text()
      return tx.includes("pathlib")
    }, "file")
    assertInstanceOf(found, PathLike)
  })
})


Deno.test("メソッド iterdirSome: iterdir() の返り値に対して Array.some() のような処理を行う ", async t => {
  const dir_p = new PathLike("test_data", "data_1")
  
  await t.step("OK: [ファイル] true になるパスがあれば true を返す", async () => {
    const is_some_true = await dir_p.iterdirSome((p:PathLike) => p.name.includes("text"))
    assertEquals(is_some_true, true)
  })

  await t.step("fail-OK: [ファイル] true になるパスがなければ false を返す", async ()=>{
    const is_some_true = await dir_p.iterdirSome((p:PathLike) => p.name.includes("_______"))
    assertEquals(is_some_true, false)
  })

  await t.step("OK: [ディレクトリ] true になるパスがあれば PathLike を返す", async () => {
    const is_some_true = await dir_p.iterdirSome((p:PathLike) => p.name.includes("data"), "dir")
    assertEquals(is_some_true, true)
  })

  await t.step("fail-OK: [ディレクトリ] true になるパスがなければ undefined を返す", async ()=>{
    const is_some_true = await dir_p.iterdirSome((p:PathLike) => p.name.includes("_______"), "dir")
    assertEquals(is_some_true, false)
  })

  await t.step("OK: [both] true になるパスがあれば PathLike を返す", async () => {
    const is_some_true = await dir_p.iterdirSome(
      (p:PathLike) => p.name.startsWith("data") || p.name.startsWith("text"), "both")
    assertEquals(is_some_true, true)
  })

  await t.step("fail-OK: [both] true になるパスがなければ undefined を返す", async ()=>{
    const is_some_true = await dir_p.iterdirSome(
      (p:PathLike) => p.name.startsWith("__data") || p.name.startsWith("__text"), "both")
    assertEquals(is_some_true, false)
  })

  await t.step("OK: 非同期関数を渡した場合も同様に機能する", async () => {
    const found = await dir_p.iterdirSome( async p => {
      if (p.suffix != ".txt"){ return false }
      const tx = await p.read_text()
      return tx.includes("pathlib")
    }, "file")
    assertEquals(found, true)
  })
})


Deno.test("メソッド iterdirEvery: iterdir() の返り値に対して Array.every() のような処理を行う ", async t => {
  const dir_p = new PathLike("test_data", "data_1")
  
  await t.step("OK: [ファイル] 全てのパスで true ならば true を返す", async () => {
    const is_some_true = await dir_p.iterdirEvery(
      (p:PathLike) => p.name=="sample" || p.suffix==".txt" || p.suffix == ".json")
    assertEquals(is_some_true, true)
  })

  await t.step("fail-OK: [ファイル] いずれかのパスで false になれば false を返す", async ()=>{
    const is_some_true = await dir_p.iterdirEvery((p:PathLike) => p.suffix == ".txt")
    assertEquals(is_some_true, false)
  })

  await t.step("OK: [ディレクトリ] 全てのパスで true ならば PathLike を返す", async () => {
    const is_some_true = await dir_p.iterdirEvery((p:PathLike) => p.name.startsWith("data_1"), "dir")
    assertEquals(is_some_true, true)
  })

  await t.step("fail-OK: [ディレクトリ] いずれかのパスで false になれば false を返す", async ()=>{
    const is_some_true = await dir_p.iterdirEvery((p:PathLike) => p.name.endsWith("2"), "dir")
    assertEquals(is_some_true, false)
  })

  await t.step("OK: [both] 全てのパスで true ならば PathLike を返す", async () => {
    const is_some_true = await dir_p.iterdirEvery(
      (p:PathLike) => p.name=="sample" || p.name.includes("1") || p.suffix == ".txt" || p.suffix == ".json", "both")
    assertEquals(is_some_true, true)
  })

  await t.step("fail-OK: [both] いずれかのパスで false になれば false を返す", async ()=>{
    const is_some_true = await dir_p.iterdirEvery(
      (p:PathLike) => p.name=="sample" || p.name.includes("1"), "both")
    assertEquals(is_some_true, false)
  })

  await t.step("OK: 非同期関数を渡した場合も同様に機能する", async () => {
    const is_some_true = await dir_p.iterdirEvery( async p => {
      if (p.suffix != ".txt"){ return true }
      const tx = await p.read_text()
      return (tx.length > 0)
    }, "file")
    assertEquals(is_some_true, true)
  })
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
    await nested_child.mkdir({recursive: true})
    const iter = Deno.readDir(nested_child.path)
    assertExists(iter)
    await Deno.remove(nested_child.path, {recursive:true})
  })
})


Deno.test("メソッド move: ファイル/ディレクトリを移動し、移動後の PathLike を返す", async t => {
  await t.step("OK: ファイルを移動", async () => {
    const base_p = new PathLike("test_data", "data_1", "text_1.txt")
    const expected = await base_p.read_text()
    const target = new PathLike("test_data", "moved.txt")
    const moved = await base_p.move(target)
    const actual = await moved.read_text()
    assertEquals(actual, expected)
    await moved.move(base_p)
  })

  await t.step("OK: ディレクトリを移動", async () => {
    const base_p = new PathLike("test_data", "data_2")
    const expteced = await base_p.iterdirMap(p => p.name).then(lis => lis.sort().join(", "))
    const target = new PathLike("test_data", "moved_dir")
    const moved = await base_p.move(target)
    const actual = await moved.iterdirMap(p => p.name).then(lis => lis.sort().join(", "))
    assertEquals(actual, expteced)
    await moved.move(base_p)
  })
})


Deno.test("メソッド moveToDir: 指定したパスの下にファイル/ディレクトリを移動し、移動後の PathLike を返す", async t => {
  await t.step("OK: ファイルを移動", async () => {
    const base_p = new PathLike("test_data", "data_1", "text_1.txt")
    const expected = await base_p.read_text()
    const moved = await base_p.moveInto("test_data")
    const actual = await moved.read_text()
    assertEquals(actual, expected)
    await moved.move(base_p)
  })

  await t.step("OK: ディレクトリを移動", async () => {
    const base_p = new PathLike("test_data", "data_2")
    const expteced = await base_p.iterdirMap(p => p.name).then(lis => lis.sort().join(", "))
    const moved = await base_p.moveInto(Deno.cwd())
    const actual = await moved.iterdirMap(p => p.name).then(lis => lis.sort().join(", "))
    assertEquals(actual, expteced)
    await moved.move(base_p)
  })

  await t.step("Fail-OK: ディレクトリではないパスを指定するとエラー", async () => {
    const base_p = new PathLike("test_data", "data_1", "text_1.txt")
    try {
      const target = new PathLike("test_data", "data_1", "before.txt")
      const moved = await base_p.moveInto(target)
      await moved.move(base_p)
    } catch (error) {
      assertIsError(error, Error, "is not directory.")
    }
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
    await text_path.write_text("before") // trunacate が中身を消してしまうので元に戻す
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
    text_path.write_textSync("before") // trunacate が中身を消してしまうので元に戻す
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


Deno.test("メソッド read_lines: テキストファイルを読み込み改行で分割した array を返す", async t => {
  const file_p = new PathLike("test_data", "data_1", "object.json")
  const expected = [
    '{', '  "bool": true,', '  "short array": [1, 2, 3],', '  "long array": [',
    '    {"x": 1, "y": 2},', '    {"x": 2, "y": 1},', '    {"x": 1, "y": 1},',
    '    {"x": 2, "y": 2}', '  ]', '}']
  
  await t.step("OK: 配列として読み込む", async () => {
    const actual = await file_p.read_lines()
    assertEquals(expected, actual)
  })

  await t.step("OK: 配列の長さを指定して読み込む", async () => {
    const actual = await file_p.read_lines(5)
    assertEquals(actual.length, 5)
  })

  // 改行コードの違いにも対応できることのテスト ....
})


Deno.test("メソッド read_linesSync: テキストファイルを読み込み改行で分割した array を返す", async t => {
  const file_p = new PathLike("test_data", "data_1", "object.json")
  const expected = [
    '{', '  "bool": true,', '  "short array": [1, 2, 3],', '  "long array": [',
    '    {"x": 1, "y": 2},', '    {"x": 2, "y": 1},', '    {"x": 1, "y": 1},',
    '    {"x": 2, "y": 2}', '  ]', '}']
  
  await t.step("OK: 配列として読み込む", () => {
    const actual = file_p.read_linesSync()
    assertEquals(expected, actual)
  })

  await t.step("OK: 配列の長さを指定して読み込む", () => {
    const actual = file_p.read_linesSync(5)
    assertEquals(actual.length, 5)
  })

  // 改行コードの違いにも対応できることのテスト ....
})


Deno.test("メソッド read_JSON: テキストファイルを読み込んで JSON に変換して返す", async _t => {
  const file_p = new PathLike("test_data", "data_1", "object.json")
  const expected = { "bool": true, "short array": [1, 2, 3], "long array": [
      {"x": 1, "y": 2}, {"x": 2, "y": 1}, {"x": 1, "y": 1}, {"x": 2, "y": 2} ] }
  const actual = await file_p.read_JSON()
  assertEquals(JSON.stringify(expected), JSON.stringify(actual))
})


Deno.test("メソッド read_JSONSync: テキストファイルを読み込んで JSON に変換して返す", _t => {
  const file_p = new PathLike("test_data", "data_1", "object.json")
  const expected = { "bool": true, "short array": [1, 2, 3], "long array": [
      {"x": 1, "y": 2}, {"x": 2, "y": 1}, {"x": 1, "y": 1}, {"x": 2, "y": 2} ] }
  const actual = file_p.read_JSONSync()
  assertEquals(JSON.stringify(expected), JSON.stringify(actual))
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


Deno.test("メソッド renameTo: 名前を指定してリネームし新しいパスのパスオブジェクトを返す", async t => {
  const before = new PathLike("test_data", "data_1", "before.txt")
  const after = new PathLike("test_data", "data_1", "after.txt")

  await t.step(`OK: リネームする`, async () => {
    const renamed = await before.renameTo("after.txt")
    assertEquals(renamed.path, after.path)
    await renamed.renameTo("before.txt")
  })

  await t.step(`Fail-OK: リネーム先のパスがすでに存在する場合はエラーを出す`, async () => {
    try {
      await before.renameTo("text_1.txt")
    } catch (error) {
      assertIsError(error, Error, "already exists.")
    }
  })
})


Deno.test("メソッド resolve: 絶対パスに変更した PathLike を返す", async t => {
  const base_dir = new PathLike(Deno.env.get("GitHubPath")!, "deno_pathlib")
  const file = new PathLike("test_data", "data_1", "text_1.txt")
  const abs = new PathLike(base_dir, file)

  await t.step(`OK: 相対から絶対パスを解決`, () => {
    assertEquals(file.resolve().path, abs.path)
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


Deno.test("メソッド write_JSON: オブジェクトを JSON.stringify() した結果をファイルに書き込む", async t => {
  const to_create = new PathLike("test_data", "data_1", "temp.json")
  const obj = { "bool": true, "short array": [1, 2, 3], "long array": [
      {"x": 1, "y": 2}, {"x": 2, "y": 1}, {"x": 1, "y": 1}, {"x": 2, "y": 2} ] }

  await t.step(`OK: 存在しない場合はファイルを作成`, async () => {
    await to_create.write_JSON(obj)
    const actual = await to_create.read_JSON()
    assertEquals(JSON.stringify(obj), JSON.stringify(actual))
    await to_create.remove()
  })

  await t.step(`Fail-OK: create = false の場合は存在しないファイルならエラー`, async () => {
    try {
      await to_create.write_JSON(obj, {create:false})  
    } catch (error) {
      assertIsError(error, Error, "指定されたファイルが見つかりません")
    }
  })
  
  // mode = "a" で JSON を出力することは稀と思われるのでスキップ
  
  await t.step(`Fail-OK: mode = "x" で既存ファイルにアクセスした場合はエラー`, async () => {
    await to_create.write_JSON(obj)
    try {
      await to_create.write_JSON(obj, {mode:"x"})
    } catch (error) {
      assertIsError(error, Error, "already exists.")
      await to_create.remove()
    }
  })
})


Deno.test("メソッド write_JSONSync: オブジェクトを JSON.stringify() した結果をファイルに書き込む", async t => {
  const to_create = new PathLike("test_data", "data_1", "temp.json")
  const obj = { "bool": true, "short array": [1, 2, 3], "long array": [
      {"x": 1, "y": 2}, {"x": 2, "y": 1}, {"x": 1, "y": 1}, {"x": 2, "y": 2} ] }

  await t.step(`OK: 存在しない場合はファイルを作成`, async () => {
    to_create.write_JSONSync(obj)
    const actual = to_create.read_JSONSync()
    assertEquals(JSON.stringify(obj), JSON.stringify(actual))
    await to_create.remove()
  })

  await t.step(`Fail-OK: create = false の場合は存在しないファイルならエラー`, () => {
    try {
      to_create.write_JSONSync(obj, {create:false})  
    } catch (error) {
      assertIsError(error, Error, "指定されたファイルが見つかりません")
    }
  })
  
  // mode = "a" で JSON を出力することは稀と思われるのでスキップ
  
  await t.step(`Fail-OK: mode = "x" で既存ファイルにアクセスした場合はエラー`, async () => {
    to_create.write_JSONSync(obj)
    try {
      to_create.write_JSONSync(obj, {mode:"x"})
    } catch (error) {
      assertIsError(error, Error, "already exists.")
      await to_create.remove()
    }
  })
})