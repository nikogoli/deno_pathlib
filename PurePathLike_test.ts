import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts"
import * as DenoPath from "https://deno.land/std@0.170.0/path/mod.ts"

import { PurePathLike } from "./PurePathLike.ts"


const usual_abs_pstring = "C:/Users/Default/AppData/Local/Microsoft/Windows/Shell/DefaultLayouts.tar.gz"
const escaped_abs_pstring = "C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz"

const usual_dot_pstring = "./Users/Default/AppData/Local/Microsoft/Windows/Shell/DefaultLayouts.tar.gz"
const escaped_dot_pstring = ".\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz"

const usual_rel_pstring = "Users/Default/AppData/Local/Microsoft/Windows/Shell/DefaultLayouts.tar.gz"
const escaped_rel_pstring = "Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz"

const usual_noroot_pstring = "C:Users/Default/AppData/Local/Microsoft/Windows/Shell/DefaultLayouts.tar.gz"
const escaped_noroot_pstring = "C:Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\DefaultLayouts.tar.gz"


Deno.test("construct: input strings → set joined path as its .path", () => {
  const args = ["home", "routes", "temp.ts"]
  const actural = new PurePathLike(...args).path
  const expected = DenoPath.join(...args)
  assertEquals(actural, expected)
})


// ------------- single input  --------------------
Deno.test("Abs → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const inputs = [usual_abs_pstring, escaped_abs_pstring]
  inputs.forEach(str => {
    const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike(str)
    const expected_parts = ["C:\\", "Users", "Default", "AppData", "Local", "Microsoft", "Windows", "Shell", "DefaultLayouts.tar.gz"]
    const expected_anchor = "C:\\"
    const expected_drive = "C:"
    const expected_root = "\\"
    const expected_name = "DefaultLayouts.tar.gz"
    const expected_stem = "DefaultLayouts.tar"
    const expected_suffixes = [".tar",".gz"]
    const expected_suffix = ".gz"
    assertEquals(parts, expected_parts)
    assertEquals(anchor, expected_anchor)
    assertEquals(drive, expected_drive)
    assertEquals(root, expected_root)
    assertEquals(name, expected_name)
    assertEquals(stem, expected_stem)
    assertEquals(suffixes, expected_suffixes)
    assertEquals(suffix, expected_suffix)
  })
})


Deno.test("Abs → .parent*", () => {
  const inputs = [usual_abs_pstring, escaped_abs_pstring]
  inputs.forEach(str => {
    const { parent, parents } = new PurePathLike(str)
    const expected_parents = [
      new PurePathLike("C:\\"),
      new PurePathLike("C:\\Users"),
      new PurePathLike("C:\\Users\\Default"),
      new PurePathLike("C:\\Users\\Default\\AppData"),
      new PurePathLike("C:\\Users\\Default\\AppData\\Local"),
      new PurePathLike("C:\\Users\\Default\\AppData\\Local\\Microsoft"),
      new PurePathLike("C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows"),
      new PurePathLike("C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell")
    ]
    const expected_parent = new PurePathLike("C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell")
    assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
    assertEquals(parent.path, expected_parent.path)
  })
})


Deno.test("Dot → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const inputs = [usual_dot_pstring, escaped_dot_pstring]
  inputs.forEach(str => {
    const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike(str)
    const expected_parts = ["Users", "Default", "AppData", "Local", "Microsoft", "Windows", "Shell", "DefaultLayouts.tar.gz"]
    const expected_anchor = ""
    const expected_drive = ""
    const expected_root = ""
    const expected_name = "DefaultLayouts.tar.gz"
    const expected_stem = "DefaultLayouts.tar"
    const expected_suffixes = [".tar",".gz"]
    const expected_suffix = ".gz"
    assertEquals(parts, expected_parts)
    assertEquals(anchor, expected_anchor)
    assertEquals(drive, expected_drive)
    assertEquals(root, expected_root)
    assertEquals(name, expected_name)
    assertEquals(stem, expected_stem)
    assertEquals(suffixes, expected_suffixes)
    assertEquals(suffix, expected_suffix)
  })

})


Deno.test("Dot → .parent*", () => {
  const inputs = [usual_dot_pstring, escaped_dot_pstring]
  inputs.forEach(str => {
    const { parent, parents } = new PurePathLike(str)
    const expected_parents = [
      new PurePathLike("Users"),
      new PurePathLike("Users\\Default"),
      new PurePathLike("Users\\Default\\AppData"),
      new PurePathLike("Users\\Default\\AppData\\Local"),
      new PurePathLike("Users\\Default\\AppData\\Local\\Microsoft"),
      new PurePathLike("Users\\Default\\AppData\\Local\\Microsoft\\Windows"),
      new PurePathLike("Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell")
    ]
    const expected_parent = new PurePathLike("Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell")
    assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
    assertEquals(parent.path, expected_parent.path)
  })
})


Deno.test("Rel → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const inputs = [usual_rel_pstring, escaped_rel_pstring]
  inputs.forEach(str => {
    const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike(str)
    const expected_parts = ["Users", "Default", "AppData", "Local", "Microsoft", "Windows", "Shell", "DefaultLayouts.tar.gz"]
    const expected_anchor = ""
    const expected_drive = ""
    const expected_root = ""
    const expected_name = "DefaultLayouts.tar.gz"
    const expected_stem = "DefaultLayouts.tar"
    const expected_suffixes = [".tar",".gz"]
    const expected_suffix = ".gz"
    assertEquals(parts, expected_parts)
    assertEquals(anchor, expected_anchor)
    assertEquals(drive, expected_drive)
    assertEquals(root, expected_root)
    assertEquals(name, expected_name)
    assertEquals(stem, expected_stem)
    assertEquals(suffixes, expected_suffixes)
    assertEquals(suffix, expected_suffix)
  })

})


Deno.test("Rel → .parent*", () => {
  const inputs = [usual_rel_pstring, escaped_rel_pstring]
  inputs.forEach(str => {
    const { parent, parents } = new PurePathLike(str)
    const expected_parents = [
      new PurePathLike("Users"),
      new PurePathLike("Users\\Default"),
      new PurePathLike("Users\\Default\\AppData"),
      new PurePathLike("Users\\Default\\AppData\\Local"),
      new PurePathLike("Users\\Default\\AppData\\Local\\Microsoft"),
      new PurePathLike("Users\\Default\\AppData\\Local\\Microsoft\\Windows"),
      new PurePathLike("Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell")
    ]
    const expected_parent = new PurePathLike("Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell")
    assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
    assertEquals(parent.path, expected_parent.path)
  })
})


Deno.test("NoRoot → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const inputs = [usual_noroot_pstring, escaped_noroot_pstring]
  inputs.forEach(str => {
    const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike(str)
    const expected_parts = ["C:", "Users", "Default", "AppData", "Local", "Microsoft", "Windows", "Shell", "DefaultLayouts.tar.gz"]
    const expected_anchor = "C:"
    const expected_drive = "C:"
    const expected_root = ""
    const expected_name = "DefaultLayouts.tar.gz"
    const expected_stem = "DefaultLayouts.tar"
    const expected_suffixes = [".tar",".gz"]
    const expected_suffix = ".gz"
    assertEquals(parts, expected_parts)
    assertEquals(anchor, expected_anchor)
    assertEquals(drive, expected_drive)
    assertEquals(root, expected_root)
    assertEquals(name, expected_name)
    assertEquals(stem, expected_stem)
    assertEquals(suffixes, expected_suffixes)
    assertEquals(suffix, expected_suffix)
  })
})


Deno.test("NoRoot → .parent*", () => {
  const inputs = [usual_noroot_pstring, escaped_noroot_pstring]
  inputs.forEach(str => {
    const { parent, parents } = new PurePathLike(str)
    const expected_parents = [
      new PurePathLike("C:"),
      new PurePathLike("C:Users"),
      new PurePathLike("C:Users\\Default"),
      new PurePathLike("C:Users\\Default\\AppData"),
      new PurePathLike("C:Users\\Default\\AppData\\Local"),
      new PurePathLike("C:Users\\Default\\AppData\\Local\\Microsoft"),
      new PurePathLike("C:Users\\Default\\AppData\\Local\\Microsoft\\Windows"),
      new PurePathLike("C:Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell")
    ]
    const expected_parent = new PurePathLike("C:Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell")
    assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
    assertEquals(parent.path, expected_parent.path)
  })
})


// ------- other single input --------------
Deno.test("'C:\\single.txt' → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike('C:\\single.txt')
  const expected_parts = ["C:\\", "single.txt"]
  const expected_anchor = "C:\\"
  const expected_drive = "C:"
  const expected_root = "\\"
  const expected_name = "single.txt"
  const expected_stem = "single"
  const expected_suffixes = [".txt"]
  const expected_suffix = ".txt"
  assertEquals(parts, expected_parts)
  assertEquals(anchor, expected_anchor)
  assertEquals(drive, expected_drive)
  assertEquals(root, expected_root)
  assertEquals(name, expected_name)
  assertEquals(stem, expected_stem)
  assertEquals(suffixes, expected_suffixes)
  assertEquals(suffix, expected_suffix)
})


Deno.test("'C:\\single.txt' → .parent*", () => {
  const { parent, parents } = new PurePathLike('C:\\single.txt')
  const expected_parents = [ new PurePathLike("C:\\") ]
  const expected_parent = new PurePathLike("C:\\")
  assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
  assertEquals(parent.path, expected_parent.path)
})


Deno.test("'single.txt' → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike('single.txt')
  const expected_parts = ["single.txt"]
  const expected_anchor = ""
  const expected_drive = ""
  const expected_root = ""
  const expected_name = "single.txt"
  const expected_stem = "single"
  const expected_suffixes = [".txt"]
  const expected_suffix = ".txt"
  assertEquals(parts, expected_parts)
  assertEquals(anchor, expected_anchor)
  assertEquals(drive, expected_drive)
  assertEquals(root, expected_root)
  assertEquals(name, expected_name)
  assertEquals(stem, expected_stem)
  assertEquals(suffixes, expected_suffixes)
  assertEquals(suffix, expected_suffix)
})


Deno.test("'single.txt' → .parent*", () => {
  const { parent, parents } = new PurePathLike('single.txt')
  const expected_parents = [ new PurePathLike(".") ]
  const expected_parent = new PurePathLike(".")
  assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
  assertEquals(parent.path, expected_parent.path)
})


Deno.test("'./single.txt' → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike('./single.txt')
  const expected_parts = ["single.txt"]
  const expected_anchor = ""
  const expected_drive = ""
  const expected_root = ""
  const expected_name = "single.txt"
  const expected_stem = "single"
  const expected_suffixes = [".txt"]
  const expected_suffix = ".txt"
  assertEquals(parts, expected_parts)
  assertEquals(anchor, expected_anchor)
  assertEquals(drive, expected_drive)
  assertEquals(root, expected_root)
  assertEquals(name, expected_name)
  assertEquals(stem, expected_stem)
  assertEquals(suffixes, expected_suffixes)
  assertEquals(suffix, expected_suffix)
})


Deno.test("'./single.txt' →  .parent*", () => {
  const { parent, parents } = new PurePathLike('./single.txt')
  const expected_parents = [ new PurePathLike(".") ]
  const expected_parent = new PurePathLike(".")
  assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
  assertEquals(parent.path, expected_parent.path)
})


Deno.test("'C:\\' → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike('C:\\')
  const expected_parts = ["C:\\"]
  const expected_anchor = "C:\\"
  const expected_drive = "C:"
  const expected_root = "\\"
  const expected_name = ""
  const expected_stem = ""
  const expected_suffixes = [] as Array<string>
  const expected_suffix = ""
  assertEquals(parts, expected_parts)
  assertEquals(anchor, expected_anchor)
  assertEquals(drive, expected_drive)
  assertEquals(root, expected_root)
  assertEquals(name, expected_name)
  assertEquals(stem, expected_stem)
  assertEquals(suffixes, expected_suffixes)
  assertEquals(suffix, expected_suffix)
})


Deno.test("'C:\\' → .parent*", () => {
  const { parent, parents } = new PurePathLike('C:\\')
  const expected_parents = [] as Array<PurePathLike>
  const expected_parent = new PurePathLike("C:\\")
  assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
  assertEquals(parent.path, expected_parent.path)
})



Deno.test("'C:' → .parts, .anchor, .drive, .root, .name, .stem, .suf*", () => {
  const { parts, anchor, drive, root, name, stem, suffixes, suffix } = new PurePathLike('C:')
  const expected_parts = ["C:"]
  const expected_anchor = "C:"
  const expected_drive = "C:"
  const expected_root = ""
  const expected_name = ""
  const expected_stem = ""
  const expected_suffixes = [] as Array<string>
  const expected_suffix = ""
  assertEquals(parts, expected_parts)
  assertEquals(anchor, expected_anchor)
  assertEquals(drive, expected_drive)
  assertEquals(root, expected_root)
  assertEquals(name, expected_name)
  assertEquals(stem, expected_stem)
  assertEquals(suffixes, expected_suffixes)
  assertEquals(suffix, expected_suffix)
})


Deno.test("'C:' → .parent*", () => {
  const { parent, parents } = new PurePathLike('C:')
  const expected_parents = [] as Array<PurePathLike>
  const expected_parent = new PurePathLike("C:")
  assertEquals(parents().map(p => p.path), expected_parents.map(p => p.path))
  assertEquals(parent.path, expected_parent.path)
})