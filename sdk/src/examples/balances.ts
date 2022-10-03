import yargs from 'yargs'

import printObject from '../utils/printObject'
import getLyra from './utils/getLyra'
import getSigner from './utils/getSigner'

export default async function balances(argv: string[]) {
  const lyra = getLyra()
  const signer = getSigner(lyra)
  const args = await yargs(argv).options({
    account: { type: 'string', alias: 'a', require: false },
  }).argv
  const account = lyra.account(args.account ?? signer.address)
  const accountBalances = await account.balances()
  printObject(accountBalances)
}
