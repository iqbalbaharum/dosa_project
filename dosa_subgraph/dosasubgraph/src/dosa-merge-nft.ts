import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Equip
} from "../generated/DosaMergeNFT/DosaMergeNFT"
import { MergeNFT } from "../generated/schema"

export function handleEquip(event: Equip): void {
  let entity = MergeNFT.load(event.transaction.hash.toHex())
  if (!entity) {
    entity = new MergeNFT(event.transaction.hash.toHex())
  }
  entity.baseAddress = event.params.baseAddress
  entity.baseTokenId = event.params.baseTokenId
  entity.consumableAddress = event.params.consumableAddress
  entity.consumableTokenId = event.params.consumableTokenId
  entity.blockNo = event.block.number
  entity.save()
  log.info('MergeNFT for: base {} {}, consumable ', [
      event.params.baseAddress.toHexString(), event.params.baseTokenId.toString(),
      event.params.consumableAddress.toHexString(), event.params.consumableTokenId.toString()
  ])
}
