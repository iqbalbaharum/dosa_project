import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Mint,
  Topup,
  CashOut
} from "../generated/Dosa2MintBurn/Dosa2MintBurn"
import { MintBurnMint, MintBurnTopup, MintBurnCashOut } from "../generated/schema"

export function handleMint(event: Mint): void {
  let entity = MintBurnMint.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new MintBurnMint(event.transaction.hash.toHex())
  }
  entity.to = event.params.to
  entity.amount = event.params.amount
  entity.blockNo = event.block.number
  entity.save()
  log.info('MintBurnMint: {} {}', [event.params.to.toHexString(), event.params.amount.toString()])
}

export function handleTopup(event: Topup): void {
  let entity = MintBurnTopup.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new MintBurnTopup(event.transaction.hash.toHex())
  }
  entity.to = event.params.to
  entity.amount = event.params.amount
  entity.blockNo = event.block.number
  entity.save()
  log.info('MintBurnTopup: {} {}', [event.params.to.toHexString(), event.params.amount.toString()])
}

export function handleCashOut(event: CashOut): void {
  let entity = MintBurnCashOut.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new MintBurnCashOut(event.transaction.hash.toHex())
  }
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId
  entity.blockNo = event.block.number
  entity.save()
  log.info('MintBurnCashOut: {} {}', [event.params.to.toHexString(), event.params.tokenId.toString()])
}

