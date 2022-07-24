import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Transfer
} from "../generated/DosaSlotNFT/DosaSlotNFT"
import { SlotMint, SlotBurn } from "../generated/schema"

export function handleTransfer(event: Transfer): void {
  if (event.params.from.toHex() == '0x0000000000000000000000000000000000000000') {
    let entity = SlotMint.load(event.transaction.hash.toHex())
    if (!entity) {
      entity = new SlotMint(event.transaction.hash.toHex())
    }
    entity.from = event.params.from
    entity.to = event.params.to
    entity.tokenId = event.params.tokenId
    entity.blockNo = event.block.number
    entity.save()
    log.info('SlotMint: {} to {} with tokenId {}', [event.params.from.toHexString(), event.params.to.toHexString(), event.params.tokenId.toString()])
  }
  if (event.params.to.toHex() == '0x0000000000000000000000000000000000000000') {
    let entity = SlotBurn.load(event.transaction.hash.toHex())
    if (!entity) {
      entity = new SlotBurn(event.transaction.hash.toHex())
    }
    entity.from = event.params.from
    entity.to = event.params.to
    entity.tokenId = event.params.tokenId
    entity.blockNo = event.block.number
    entity.save()
    log.info('SlotBurn: {} to {} with tokenId {}', [event.params.from.toHexString(), event.params.to.toHexString(), event.params.tokenId.toString()])
  }
}

