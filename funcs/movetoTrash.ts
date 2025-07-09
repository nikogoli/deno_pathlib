export default async function movetoTrash(path:string){
  const code = `
  $shell = New-Object -ComObject "Shell.Application"
  $recycleBin = $shell.Namespace(0xA)
  $recycleBin.MoveHere("${path}")
  `

  const process = new Deno.Command("powershell", {
    args: [code],
  })

  const _status = await process.output()
  //const msg = new TextDecoder().decode(status.stdout)
  //const errmsg = new TextDecoder().decode(status.stderr)
  //console.log(msg)
  //console.log(errmsg)
}
