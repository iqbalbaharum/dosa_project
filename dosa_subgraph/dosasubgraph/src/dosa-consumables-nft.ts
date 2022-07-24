import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  TransferSingle
} from "../generated/DosaConsumablesNFT/DosaConsumablesNFT"
import { ConsumablesMint, ConsumablesBurn } from "../generated/schema"

export function handleTransferSingle(event: TransferSingle): void {
  if (event.params.from.toHex() == '0x0000000000000000000000000000000000000000') {
    let entity = ConsumablesMint.load(event.transaction.hash.toHex())
    if (!entity) {
      entity = new ConsumablesMint(event.transaction.hash.toHex())
    }
    entity.operator = event.params.operator
    entity.from = event.params.from
    entity.to = event.params.to
    entity.tokenId = event.params.id
    entity.value = event.params.value
    entity.blockNo = event.block.number
    entity.save()
    log.info('ConsumablesMint: {} to {} with tokenId {}', [event.params.from.toHexString(), event.params.to.toHexString(), event.params.id.toString()])
  }
  if (event.params.to.toHex() == '0x0000000000000000000000000000000000000000') {
    let entity = ConsumablesBurn.load(event.transaction.hash.toHex())
    if (!entity) {
      entity = new ConsumablesBurn(event.transaction.hash.toHex())
    }
    entity.operator = event.params.operator
    entity.from = event.params.from
    entity.to = event.params.to
    entity.tokenId = event.params.id
    entity.value = event.params.value
    entity.blockNo = event.block.number
    entity.save()
    log.info('ConsumablesBurn: {} to {} with tokenId {}', [event.params.from.toHexString(), event.params.to.toHexString(), event.params.id.toString()])
  }
}

