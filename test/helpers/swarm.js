export async function connect (from, to) {
  const toId = await to.id()
  from.swarm.connect(toId.addresses[0])
}
